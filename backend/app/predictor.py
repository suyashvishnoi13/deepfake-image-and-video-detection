
import torch
import numpy as np
from PIL import Image
from torchvision import transforms

from .model import (
    image_model,
    video_model,
    DEVICE,
    VIDEO_THRESHOLD
)


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# IMAGE PREDICTION
def predict(image: Image.Image):

    image = transform(image.convert("RGB"))
    image = image.unsqueeze(0).to(DEVICE)

    with torch.inference_mode():
        output = image_model(image)
        probabilities = torch.softmax(output, dim=1)

    real_score = probabilities[0][0].item() * 100
    fake_score = probabilities[0][1].item() * 100

    prediction = (
        "REAL" if real_score >= fake_score else "FAKE"
    )

    return {
        "prediction": prediction,
        "confidence": round(max(real_score, fake_score), 2),
        "authenticity_percentage": round(real_score, 2),
        "fake_percentage": round(fake_score, 2)
    }


# VIDEO PREDICTION
def predict_video_frames(frames):

    if not frames:
        raise ValueError("No frames available for prediction.")

    all_probabilities = []
    BATCH_SIZE = 8

    with torch.inference_mode():

        for i in range(0, len(frames), BATCH_SIZE):

            batch_frames = frames[i:i + BATCH_SIZE]

            tensors = torch.stack([
                transform(frame.convert("RGB"))
                for frame in batch_frames
            ]).to(DEVICE)

            outputs = video_model(tensors)

            probabilities = torch.softmax(outputs, dim=1)

            all_probabilities.append(probabilities.cpu())

    probabilities = torch.cat(all_probabilities, dim=0)

    fake_scores = probabilities[:, 1].numpy() * 100

    average_fake = float(np.mean(fake_scores))
    median_fake = float(np.median(fake_scores))

    real_score = 100 - average_fake
    fake_score = average_fake

    prediction = (
        "FAKE"
        if average_fake / 100 >= VIDEO_THRESHOLD
        else "REAL"
    )

    return {
        "prediction": prediction,
        "confidence": round(max(real_score, fake_score), 2),
        "authenticity_percentage": round(real_score, 2),
        "fake_percentage": round(fake_score, 2),
        "frames_analyzed": len(frames),
        "median_fake_score": round(median_fake, 2),
        "threshold": VIDEO_THRESHOLD,
        "frame_fake_scores": [
            round(float(x), 2) for x in fake_scores
        ]
    }
