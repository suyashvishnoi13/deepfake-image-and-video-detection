
import torch
import torch.nn as nn
from torchvision import models
from pathlib import Path

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "models"

IMAGE_MODEL_PATH = MODEL_DIR / "best_deepfake_model.pth"
VIDEO_MODEL_PATH = MODEL_DIR / "deepfake_final.pth"


def load_efficientnet(checkpoint_path, dropout=0.3):

    if not checkpoint_path.exists():
        raise FileNotFoundError(
            f"Model not found: {checkpoint_path}"
        )

    model = models.efficientnet_b0(weights=None)

    in_features = model.classifier[1].in_features

    model.classifier[1] = nn.Sequential(
        nn.Dropout(dropout),
        nn.Linear(in_features, 2)
    )

    checkpoint = torch.load(
        checkpoint_path,
        map_location=DEVICE,
        weights_only=True
    )

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)

    model = model.to(DEVICE)
    model.eval()

    return model, checkpoint


# IMAGE MODEL
image_model, image_checkpoint = load_efficientnet(
    IMAGE_MODEL_PATH,
    dropout=0.3
)

# VIDEO MODEL
video_model, video_checkpoint = load_efficientnet(
    VIDEO_MODEL_PATH,
    dropout=0.4
)

# VIDEO THRESHOLD
VIDEO_THRESHOLD = (
    video_checkpoint.get("threshold", 0.54)
    if isinstance(video_checkpoint, dict)
    else 0.54
)

print("\nBoth models loaded successfully!")
print("Device:", DEVICE)
print("Image model:", IMAGE_MODEL_PATH.name)
print("Video model:", VIDEO_MODEL_PATH.name)
print("Video threshold:", VIDEO_THRESHOLD)
