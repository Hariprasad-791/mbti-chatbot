FROM node:18-alpine

WORKDIR /app

# Install system dependencies required for react-scripts
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
