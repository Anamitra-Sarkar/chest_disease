FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (curl for health checks, git for HF model download)
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install huggingface-hub for model downloading
RUN pip install --no-cache-dir huggingface-hub

# Copy application code
COPY backend/ ./backend/
COPY app.py .

# Download model from Hugging Face
RUN python -c "from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='Arko007/chexpert-cnn-from-scratch', filename='epoch_001_mAUROC_0.486525.pth', local_dir='.')"

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV INFERENCE_DEVICE=cpu
ENV MODEL_PATH=epoch_001_mAUROC_0.486525.pth

# Expose port (will be overridden by PORT env var at runtime)
EXPOSE 7860

# Run the application with dynamic port from environment
CMD python -m uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860}
