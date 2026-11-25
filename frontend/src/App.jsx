
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

function App() {
  const [mode, setMode] = useState("image");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Clean up preview URLs when the selected file changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // IMAGE / VIDEO PREDICTION
  const handlePredict = async () => {
    if (!file) {
      setError(`Please select a ${mode} first.`);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const endpoint =
      mode === "image" ? "/predict" : "/predict-video";

    try {
      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        formData,
        {
          timeout: 180000
        }
      );

      setResult(response.data);

    } catch (err) {
      console.error("Prediction error:", err);

      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please try again.");
      } else {
        setError(
          err.response?.data?.detail ||
          "Prediction failed. Please check whether the backend is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  const changeMode = (newMode) => {
    if (newMode === mode) return;

    setMode(newMode);
    clearSelection();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";

    const mb = bytes / (1024 * 1024);

    return mb < 1
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${mb.toFixed(2)} MB`;
  };

  const isFake =
    result?.prediction?.toLowerCase() === "fake";

  return (
    <div className="app">
      <div className="ambient-glow" />

      <main className="container">

        {/* HEADER */}
        <header className="header">
          <div className="badge">
            <span className="pulse-dot" />
            AI MEDIA FORENSICS
          </div>

          <h1>Deepfake Detection</h1>

          <p className="subtitle">
            Upload an image or video to analyze neural manipulation
            and media authenticity
          </p>
        </header>

        {/* MODE SWITCHER */}
        <div className="mode-switcher" role="tablist">

          <button
            type="button"
            role="tab"
            aria-selected={mode === "image"}
            className={`mode-btn ${mode === "image" ? "active" : ""}`}
            onClick={() => changeMode("image")}
          >
            <svg viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Image Detection
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "video"}
            className={`mode-btn ${mode === "video" ? "active" : ""}`}
            onClick={() => changeMode("video")}
          >
            <svg viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            Video Detection
          </button>

        </div>

        {/* MAIN CARD */}
        <section className="card">

          {!preview ? (

            <label
              className={`dropzone ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={
                  mode === "image"
                    ? "image/*"
                    : "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                }
                onChange={handleFileChange}
              />

              <div className="dropzone-icon">
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <p className="dropzone-title">
                Drag & drop your {mode} here, or <span>browse</span>
              </p>

              <p className="dropzone-hint">
                {mode === "image"
                  ? "Supports JPG, PNG, WEBP"
                  : "Supports MP4, MOV, AVI, MKV"}
              </p>
            </label>

          ) : (

            <div className="media-stage">

              <div className={`preview-wrapper ${loading ? "scanning" : ""}`}>

                {mode === "image" ? (
                  <img
                    src={preview}
                    alt="Selected media"
                    className="preview-media"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="preview-media"
                  />
                )}

                {loading && <div className="scan-line" />}

              </div>

              <div className="file-bar">

                <div className="file-info">
                  <span className="file-name" title={file?.name}>
                    {file?.name}
                  </span>

                  <span className="file-size">
                    {formatFileSize(file?.size)}
                  </span>
                </div>

                <button
                  type="button"
                  className="clear-btn"
                  onClick={clearSelection}
                  disabled={loading}
                >
                  Change File
                </button>

              </div>

            </div>
          )}

          {/* PREDICTION BUTTON */}
          <button
            type="button"
            className="primary-btn"
            onClick={handlePredict}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                {mode === "image"
                  ? "Scanning Pixels..."
                  : "Analyzing Video Frames..."}
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>

                {mode === "image"
                  ? "Run Deepfake Detection"
                  : "Analyze Video"}
              </>
            )}
          </button>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="error-banner" role="alert">
              <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>

              <span>{error}</span>
            </div>
          )}

          {/* RESULTS DASHBOARD */}
          {result && (
            <div className={`result-panel ${isFake ? "fake" : "real"}`}>

              <div className="result-header">

                <div>
                  <span className="result-label">VERDICT</span>
                  <h2 className="result-verdict">
                    {result.prediction}
                  </h2>
                </div>

                <div className="verdict-pill">
                  {isFake
                    ? "Manipulation Detected"
                    : "Authentic Media"}
                </div>

              </div>

              {mode === "image" ? (

                <div className="metric-block">

                  <div className="metric-row">
                    <span>Model Confidence</span>
                    <strong>{result.confidence}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, result.confidence))}%`
                      }}
                    />
                  </div>

                </div>

              ) : (

                <div className="video-metrics">

                  <div className="metric-block">
                    <div className="metric-row">
                      <span>Approximate Authenticity</span>
                      <strong>{result.authenticity_percentage}%</strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill real-bar"
                        style={{
                          width: `${Math.min(100, Math.max(0, result.authenticity_percentage))}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="metric-block">
                    <div className="metric-row">
                      <span>Fake Score</span>
                      <strong>{result.fake_percentage}%</strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill fake-bar"
                        style={{
                          width: `${Math.min(100, Math.max(0, result.fake_percentage))}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="stat-chip">
                    <span>Total Frames Analyzed</span>
                    <strong>{result.frames_analyzed}</strong>
                  </div>

                </div>
              )}

            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default App;
