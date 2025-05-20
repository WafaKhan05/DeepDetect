from dotenv import load_dotenv
import os
import urllib.request

load_dotenv()

os.makedirs("models/test", exist_ok=True)

def download_model(model_url):
    urllib.request.urlretrieve(model_url, "models/test/deepfake_model.pt")

download_model(os.getenv("DEEPFAKE_MODEL_URL"))