# Deepfake Detection System

An AI-powered Deepfake Detection System that analyzes images and videos to identify whether the given media is **REAL or FAKE** using Deep Learning and Computer Vision.

The application provides a web interface where users can upload images or videos and receive prediction results from a trained deep learning model.

## 🚀 Features

- **Image Deepfake Detection:** Upload an image and classify it as Real or Fake.
- **Video Deepfake Detection:** Analyze video frames to identify potential deepfake manipulation.
- **Deep Learning Model:** Uses a CNN-based EfficientNet-B0 architecture for binary classification.
- **Frame-Based Video Analysis:** Extracts frames from uploaded videos and evaluates them individually.
- **Prediction Confidence:** Displays prediction scores and fake probability.
- **REST API:** FastAPI-based backend for model inference.
- **Interactive Frontend:** React-based interface for uploading and analyzing media.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Programming Language | Python, JavaScript |
| Deep Learning | PyTorch, Torchvision |
| Model Architecture | EfficientNet-B0 |
| Backend | FastAPI |
| Frontend | React.js, Vite |
| Image Processing | Pillow, OpenCV |
| API Testing | Postman |
| Version Control | Git, GitHub |

## 📂 Project Structure

```text
pro/
│
├── backend/
│   ├── app/
│   │   ├── __pycache__/
│   │   ├── main.py
│   │   ├── model.py
│   │   ├── predictor.py
│   │   └── video_utils.py
│   │
│   ├── models/
│   ├── __init__.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd pro
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend API will be available at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

## 🧠 Model Architecture

The system uses **EfficientNet-B0**, a Convolutional Neural Network (CNN) architecture, for image classification.

The model processes images through multiple stages:

1. **Input Processing:** Images are resized to 224 × 224 pixels and normalized.
2. **Feature Extraction:** Convolutional layers identify visual patterns such as edges, textures, and facial details.
3. **Feature Learning:** Deeper layers learn more complex visual representations.
4. **Classification:** The final classification layer predicts one of two classes:
   - REAL (0)
   - FAKE (1)

The trained model is used for both image-level and frame-level video predictions.

## 🎥 Video Detection Workflow

1. User uploads a video through the frontend.
2. The backend receives the video through the FastAPI endpoint.
3. Video frames are extracted using the video processing module.
4. Extracted frames are passed to the trained deep learning model.
5. Individual frame predictions are analyzed.
6. The system generates the final video prediction and fake probability.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict` | Detects deepfakes in uploaded images. |
| POST | `/predict-video` | Analyzes uploaded videos for deepfake detection. |

The video prediction endpoint provides information such as:

- Final prediction
- Fake percentage
- Individual frame fake scores
- Classification threshold

## 📊 Classification Output

The model performs binary classification:

| Class | Label |
|---|---|
| 0 | REAL |
| 1 | FAKE |

## 🔮 Future Improvements

- Improve detection accuracy and generalization across datasets.
- Explore temporal feature extraction for improved video analysis.
- Optimize video processing and inference speed.
- Support additional video formats.
- Deploy the application for public access.
- Improve robustness against previously unseen deepfake generation techniques.

## 👨‍💻 Author

**Suyash Vishnoi**

B.Tech – Computer Science and Engineering  
Jaypee Institute of Information Technology (JIIT), Noida

- **GitHub:** https://github.com/suyashvishnoi13
- **Portfolio:** https://portfoliowebsitesuaysh.netlify.app

---

⭐ If you find this project interesting, consider giving it a star!