
import cv2
import os
import tempfile
import numpy as np

from PIL import Image

MAX_FRAMES = 8
MAX_DURATION = 60


def extract_video_frames(video_bytes):

    temp_path = None
    cap = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=".mp4",
            delete=False
        ) as temp:
            temp.write(video_bytes)
            temp_path = temp.name

        cap = cv2.VideoCapture(temp_path)

        if not cap.isOpened():
            raise ValueError("Unable to read video.")

        fps = cap.get(cv2.CAP_PROP_FPS)

        total_frames = int(
            cap.get(cv2.CAP_PROP_FRAME_COUNT)
        )

        if fps <= 0 or total_frames <= 0:
            raise ValueError("Invalid video file.")

        duration = total_frames / fps

        if duration > MAX_DURATION:
            raise ValueError(
                "Video must be 60 seconds or shorter."
            )

        frame_indices = np.linspace(
            0,
            total_frames - 1,
            min(MAX_FRAMES, total_frames),
            dtype=int
        )

        frames = []

        for frame_index in frame_indices:

            cap.set(
                cv2.CAP_PROP_POS_FRAMES,
                int(frame_index)
            )

            success, frame = cap.read()

            if not success:
                continue

            frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            frames.append(Image.fromarray(frame))

        if not frames:
            raise ValueError("No frames could be extracted.")

        return frames

    finally:

        if cap is not None:
            cap.release()

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
