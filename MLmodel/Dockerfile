FROM python:3.10-slim

WORKDIR /app

# System dependencies for transformers, tensorflow, etc.
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy all code and model files
COPY . .

EXPOSE 5001

CMD ["python", "app.py"]