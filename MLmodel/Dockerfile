# Use Python slim image for smaller size
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PIP_DEFAULT_TIMEOUT=1000
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    python3-dev \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with increased timeout
RUN pip install --no-cache-dir -r requirements.txt --timeout 1000

# Copy model files and application code
COPY app.py .
COPY savedata.py .
COPY kannada.py .
COPY saved_model/ ./saved_model/
COPY xgb_model.pkl .
COPY tfidf_vectorizer.pkl .
COPY mbti_label_encoder.pkl .

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "app.py"]
