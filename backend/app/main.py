
import os
import io

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from PIL import Image, UnidentifiedImageError

from .predictor import predict, predict_video_frames
from .video_utils import extract_video_frames


app = FastAPI(
    title="Deepfake Detection API",
    description="AI-powered image and video deepfake detection.",
    version="1.0.0"
)


# CORS CONFIGURATION
frontend_origins = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173,http://127.0.0.1:5173"
)

allowed_origins = [
    origin.strip()
    for origin in frontend_origins.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# FILE SIZE LIMITS
MAX_IMAGE_SIZE = 20 * 1024 * 1024

MAX_VIDEO_SIZE = 100 * 1024 * 1024


# HOME ROUTE
@app.get("/")
def home():

    return {
        "message": "Deepfake Detection API is running",
        "status": "healthy"
    }


# IMAGE PREDICTION
@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )

    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 20 MB."
        )

    try:

        image = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")

        return predict(image)

    except UnidentifiedImageError:

        raise HTTPException(
            status_code=400,
            detail="Invalid image file."
        )

    except Exception as e:

        print("Image prediction error:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Image prediction failed."
        )

    finally:
        await file.close()


# VIDEO PREDICTION
@app.post("/predict-video")
async def predict_video(file: UploadFile = File(...)):

    allowed_extensions = (
        ".mp4",
        ".mov",
        ".avi",
        ".mkv"
    )

    filename = file.filename or ""

    extension = os.path.splitext(filename)[1].lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail="Unsupported video format."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded video is empty."
        )

    if len(contents) > MAX_VIDEO_SIZE:

        raise HTTPException(
            status_code=413,
            detail="Video must be smaller than 100 MB."
        )

    try:

        frames = extract_video_frames(
            contents,
            suffix=extension
        )

        result = predict_video_frames(frames)

        return result

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        print("Video prediction error:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Video prediction failed."
        )

    finally:
        await file.close()
