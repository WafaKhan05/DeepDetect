from fastapi import FastAPI, File, UploadFile, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from ws_manager import ConnectionManager
import shutil
from dotenv import load_dotenv
import os
from datetime import datetime
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import mimetypes
from deepfake import download_model_if_needed, Model, run_prediction_in_background
import torch
import asyncio
 
load_dotenv()

UPLOAD_ROOT_DIR = "uploads"
os.makedirs(UPLOAD_ROOT_DIR, exist_ok=True)
os.makedirs("models", exist_ok=True)


download_model_if_needed(os.getenv("DEEPFAKE_MODEL_URL"))

# Load the device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

try:
    print("Initializing model...")
    global model
    model = Model(num_classes=2).to(device)
    model.load_state_dict(torch.load("models/deepfake_model.pt", map_location=device))
    model.eval()
    print("Model Loaded.")
except Exception as e:
    print("Error loading model:", e)


firebase_cred = credentials.Certificate("deepdetect_firebase.json")

firebase_app = firebase_admin.initialize_app(firebase_cred, {
    'databaseURL': os.getenv("FIREBASE_URL")
})

app = FastAPI()
ws_manager = ConnectionManager()


origins = [
    "*",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://deep-detect-web.vercel.app"
    # Add other allowed origins like deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from specified origins
    allow_credentials=True,
    allow_methods=["*"],    # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],    # Allows all headers
)


@app.get("/")
def read_root():
    return {"message": "Service is running."}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), userId: str = Form(...)):
    print(1)
    if file is None or userId is None or userId == "":
        return JSONResponse(content={"status": "error", "message": "file or userId is missing."})

    try:
        print(2)
        timestamp = datetime.now()
        dir_timestamp = timestamp.strftime("%Y%m%d_%H%M%S")
        actual_filename = file.filename
        file_extension = os.path.splitext(actual_filename)[1]
        server_filename = f"{userId}_{dir_timestamp}{file_extension}"
        upload_dir = os.path.join(UPLOAD_ROOT_DIR, userId)
        os.makedirs(upload_dir, exist_ok=True)

        file_location = os.path.join(upload_dir, server_filename)

        content_type = file.content_type

        file_type = "unknown"

        if content_type.startswith("image/"):
            file_type = "image"
        elif content_type.startswith("video/"):
            file_type = "video"
            

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        fb_ref = db.reference(f"/uploads/{userId}")

        ref = fb_ref.push({
            "file_name": actual_filename,
            "file_location": file_location,
            "uploaded_on": str(timestamp),
            "file_type": file_type,
            "status": "analyzing",
            "confidence": None,
            "prediction": None,
            "result": None,
            "analysis_completed_on": None
        })

        print(3)

        asyncio.create_task(run_prediction_in_background(model, file_location, device, ref, ws_manager, userId))

        print(7)

        return JSONResponse(content={"status": "success", "message": "Upload successful. We are analyzing your media you can see it in the history.", "filename": file.filename})
    
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": f"Upload Failed. {str(e)}"})


@app.get("/user-uploads/{userId}")
async def get_user_upload(userId: str):
    if userId is None or userId == "":
            return JSONResponse(content={"status": "error", "message": "userId is required."})
    
    try:
        fb_ref = db.reference(f"/uploads/{userId}")

        uploads = fb_ref.get()

        uploads_list = []
        for key, value in uploads.items():
            if isinstance(value, dict):
                uploads_list.append({"id": key, **value})
            else:
                uploads_list.append({"id": key, "value": value})

        return JSONResponse(content={"status": "success", "message": "User uploads fetched.", "uploads" : uploads_list})
    
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": f"Fetching Failed. {str(e)}"})



@app.get("/file/{fileId}/{userId}")
async def download_file(fileId: str, userId: str):
    if fileId is None or fileId == "" or userId is None or userId == "":
            return JSONResponse(content={"status": "error", "message": "fileId & userId is required."})
    
    try:
        fb_ref = db.reference(f"/uploads/{userId}/{fileId}")

        file_details = fb_ref.get()

        file_location = file_details["file_location"]
        file_name = file_details["file_name"]

        if not os.path.exists(file_location):
            fb_ref.delete()
            return JSONResponse(content={"status": "error", "message": f"Download Failed. {file_name} file not Found."})
        
        mime_type, _ = mimetypes.guess_type(file_location)

        return FileResponse(
            path=file_location,
            media_type=mime_type or "application/octet-stream",  # auto-detected if you want
            filename=file_name,  # prompts correct download name
            status_code=200
        )
        
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": f"Download Failed. {str(e)}"})


@app.delete("/file/{fileId}/{userId}")
async def delete_file(fileId: str, userId: str):
    if fileId is None or fileId == "" or userId is None or userId == "":
            return JSONResponse(content={"status": "error", "message": "fileId & userId is required."})
    
    try:
        fb_ref = db.reference(f"/uploads/{userId}/{fileId}")

        file_details = fb_ref.get()

        file_location = file_details["file_location"]
        file_name = file_details["file_name"]

        if not os.path.exists(file_location):
            fb_ref.delete()
            return JSONResponse(content={"status": "error", "message": f"Delete Failed. {file_name} file not Found."})
        
        os.remove(file_location)
        fb_ref.delete()

        return JSONResponse(content={"status": "success", "message": f"Delete Success."})
        
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": f"Delete Failed. {str(e)}"})
    

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await ws_manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep the connection alive
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id)
    

