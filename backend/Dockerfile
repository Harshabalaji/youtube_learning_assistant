FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies required for C-extensions, ffmpeg audio processing, and yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip, setuptools, and wheel
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy requirements file first for Docker layer caching
COPY requirements.txt .

# Install Python dependencies (uses PyTorch CPU extra-index-url from requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY . .

# Ensure data storage directories exist
RUN mkdir -p data/audio data/exports data/chroma data/logs

EXPOSE 8000

# Start server using Uvicorn with PORT environment variable support
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
