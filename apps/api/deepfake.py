# Imports
import torch
from torch import nn
from torchvision import transforms, models
from torch.utils.data import Dataset
import numpy as np
import cv2
import asyncio
import functools
from datetime import datetime
import json
import urllib.request

# Constants
im_size = 112
mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]
sm = nn.Softmax()


# Inverse normalization for image visualization
inv_normalize = transforms.Normalize(mean=-1 * np.divide(mean, std), std=np.divide([1, 1, 1], std))

# Image conversion
def im_convert(tensor):
    image = tensor.to("cpu").clone().detach()
    image = image.squeeze()
    image = inv_normalize(image)
    image = image.numpy()
    image = image.transpose(1, 2, 0)
    image = image.clip(0, 1)
    cv2.imwrite('./2.png', image * 255)
    return image

# Define the Model
class Model(nn.Module):
    def __init__(self, num_classes, latent_dim=2048, lstm_layers=1, hidden_dim=2048, bidirectional=False):
        super(Model, self).__init__()
        model = models.resnext50_32x4d(pretrained=True)
        self.model = nn.Sequential(*list(model.children())[:-2])
        self.lstm = nn.LSTM(latent_dim, hidden_dim, lstm_layers, bidirectional)
        self.relu = nn.LeakyReLU()
        self.dp = nn.Dropout(0.4)
        self.linear1 = nn.Linear(2048, num_classes)
        self.avgpool = nn.AdaptiveAvgPool2d(1)

    def forward(self, x):
        batch_size, seq_length, c, h, w = x.shape
        x = x.view(batch_size * seq_length, c, h, w)
        fmap = self.model(x)
        x = self.avgpool(fmap)
        x = x.view(batch_size, seq_length, 2048)
        x_lstm, _ = self.lstm(x, None)
        return fmap, self.dp(self.linear1(x_lstm[:, -1, :]))

# Load OpenCV DNN model
face_net = cv2.dnn.readNetFromCaffe('models/deploy.prototxt', 'models/opencv_dnn_model.caffemodel')

# Face Detection
def detect_face_dnn(image, confidence_threshold=0.9):
    h, w = image.shape[:2]
    blob = cv2.dnn.blobFromImage(image, 1.0, (300, 300), (104.0, 177.0, 123.0), False, False)
    face_net.setInput(blob)
    detections = face_net.forward()
    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > confidence_threshold:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (x1, y1, x2, y2) = box.astype("int")
            faces.append((y1, x2, y2, x1))  # top, right, bottom, left
    return faces

# Dataset for Unseen Video
class validation_dataset(Dataset):
    def __init__(self, video_names, sequence_length=60, transform=None):
        self.video_names = video_names
        self.transform = transform
        self.count = sequence_length

    def __len__(self):
        return len(self.video_names)

    def __getitem__(self, idx):
        video_path = self.video_names[idx]
        frames = []
        a = int(100 / self.count)
        first_frame = np.random.randint(0, a)

        for i, frame in enumerate(self.frame_extract(video_path)):
            faces = detect_face_dnn(frame)
            if faces:
                top, right, bottom, left = faces[0]
                try:
                    face_crop = frame[top:bottom, left:right]
                    face_crop = cv2.resize(face_crop, (112, 112))
                    if self.transform:
                        face_crop = self.transform(face_crop)
                    frames.append(face_crop)
                except:
                    continue
            if len(frames) == self.count:
                break

        if len(frames) < self.count:
            pad_count = self.count - len(frames)
            empty = torch.zeros_like(frames[0])
            frames.extend([empty] * pad_count)

        frames = torch.stack(frames)
        return frames.unsqueeze(0)

    def frame_extract(self, path):
        vidObj = cv2.VideoCapture(path)
        success = True
        while success:
            success, image = vidObj.read()
            if success:
                yield image

# Predict Function
async def predict_main(model, img, device):
    fmap, logits = model(img.to(device))
    weight_softmax = model.linear1.weight.detach().cpu().numpy()
    logits = sm(logits)
    _, prediction = torch.max(logits, 1)
    confidence = logits[:, int(prediction.item())].item() * 100
    print('Confidence of prediction:', confidence)

    # idx = np.argmax(logits.detach().cpu().numpy())
    # bz, nc, h, w = fmap.shape
    # out = np.dot(fmap[-1].detach().cpu().numpy().reshape((nc, h * w)).T, weight_softmax[idx, :].T)
    # predict = out.reshape(h, w)
    # predict = predict - np.min(predict)
    # predict_img = predict / np.max(predict)
    # predict_img = np.uint8(255 * predict_img)
    # out = cv2.resize(predict_img, (im_size, im_size))
    # heatmap = cv2.applyColorMap(out, cv2.COLORMAP_JET)
    # img = im_convert(img[:, -1, :, :, :])
    # result = heatmap * 0.5 + img * 0.8 * 255
    # cv2.imwrite('/content/1.png', result)
    # result1 = heatmap * 0.5 / 255 + img * 0.8
    # r, g, b = cv2.split(result1)
    # result1 = cv2.merge((r, g, b))
    # plt.imshow(result1)
    # plt.show()
    return [int(prediction.item()), confidence]

# Define transforms
video_transforms = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((im_size, im_size)),
    transforms.ToTensor(),
    transforms.Normalize(mean, std)
])

# # Load the trained model
# model = Model(num_classes=2).to(device)
# model.load_state_dict(torch.load('/models/deepfake_model.pt', map_location=device))
# model.eval()

# Input path to unseen videos
# path_to_videos = ["/content/drive/My Drive/fakefaces_data/512.mp4"]
# video_dataset = validation_dataset(path_to_videos, sequence_length=20, transform=video_transforms)

# Predict on unseen video
# for i in range(len(path_to_videos)):
#     print(f"\nProcessing video: {path_to_videos[i]}")
#     prediction = predict_main(model, video_dataset[i], './')
#     print("Prediction:", "REAL" if prediction[0] == 1 else "FAKE")
#     print(f"Confidence: {prediction[1]:.2f}%")

def sync_predict(model, path_to_video, device):
    print(5)
    video_dataset = validation_dataset([path_to_video], sequence_length=20, transform=video_transforms)
    return asyncio.run(predict_main(model, video_dataset[0], device))

async def run_prediction_in_background(model, file_location, device, ref, ws_manager, userId):
    print(4)
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, functools.partial(sync_predict, model, file_location, device))

    print(6)
    prediction = "REAL" if result[0] == 1 else "FAKE"
    confidence = f"{result[1]:.2f}%"

    update_obj = {
            "status": "completed",
            "confidence": confidence,
            "prediction": prediction,
            "result": prediction,
            "analysis_completed_on": str(datetime.now())
    }

    await ws_manager.send_message(userId, json.dumps({ "event": "update_status", "data": {**update_obj, "id": ref.key, "userId": userId}}))

    ref.update(update_obj)

    

# async def predict(model, path_to_video, device):
#     video_dataset = validation_dataset([path_to_video], sequence_length=20, transform=video_transforms)
#     result = await predict_main(model, video_dataset[0], device)
#     prediction = "REAL" if result[0] == 1 else "FAKE"
#     confidence = f"{result[1]:.2f}%"

#     # Update the Db with results
#     return (prediction, confidence)

def download_model(model_url):
    print("Downloading Model...")
    a, b = urllib.request.urlretrieve(model_url, "models/deepfake_model.pt")
    print(a)
    print(b)
    print("Model Downloaded.")

def download_model_if_needed(model_url, local_path="models/deepfake_model.pt"):
    import os
    import requests

    if not os.path.exists(local_path):
        print("Downloading model...")
        try:
            response = requests.get(model_url, stream=True, timeout=20)
            response.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print("Model downloaded.")
        except Exception as e:
            raise RuntimeError(f"Failed to download model: {e}")