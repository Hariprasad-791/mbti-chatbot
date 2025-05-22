# MBTI Chatbot Setup Instructions

## Prerequisites
1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Make sure Docker Desktop is running before proceeding

## Setup Steps

1. Extract the ZIP file to a folder of your choice

2. Open terminal/command prompt and navigate to the extracted folder:
```bash
cd path/to/extracted/folder
```

3. Build the Docker images:
```bash
# Build ML model image
cd MLmodel
docker build -t mbti-mlmodel .
cd ..

# Build server image
cd server
docker build -t mbti-server .
cd ..
```

4. Start all services using Docker Compose:
```bash
docker-compose up
```

## Verifying Installation

The following services should be available:
- ML Model API: http://localhost:8000
- Server API: http://localhost:5000
- MongoDB: localhost:27017

## Useful Commands

- Start containers in background:
```bash
docker-compose up -d
```

- Stop containers:
```bash
docker-compose down
```

- View logs:
```bash
docker-compose logs
```

- Check container status:
```bash
docker-compose ps
```

## Troubleshooting

If you encounter any issues:
1. Make sure Docker Desktop is running
2. Try stopping and removing all containers:
```bash
docker-compose down
docker system prune
```
3. Rebuild the images and start again 