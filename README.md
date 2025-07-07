Here’s a clean, short, and clear `README.md` file for your **MBTI Chatbot** project, written in a direct and deployable format:

````markdown
# 🧠 MBTI Chatbot Project

A cognitive psychology-based chatbot that analyzes user personality (MBTI), emotion, style, and context using machine learning models and provides personalized interactions.

---

## 🚀 Quick Setup Guide

### Step 1: Download ML Model
- Go to the MLmodel folder.
- Download `mber_mbti_model` from [Google Drive](https://drive.google.com/drive/u/1/folders/1GCbQpHecIuy214lQBHmxo18mPGfo8LAJ) and place it inside the `MLmodel/` directory.

---

### Step 2: Configure Environment

In the `server/` folder, create a `.env` file with the following content:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster1.g7off7p.mongodb.net/mbti_chatbot?retryWrites=true&w=majority&appName=Cluster1
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=2h
HUGGINGFACE_API_KEY=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
GEMINI_API_KEY=AIzaSyCyDX3odpd7x4aRqQev07578y3s1hCLY3w
````

> ⚠️ Replace `<username>` and `<password>` with your actual MongoDB Atlas credentials.

---

## 🐳 Docker Setup

In the **root** folder, run the following:

### Build & Run Client

```bash
docker build -t mbti-client ./client
docker run -d --name mbti-client -p 3000:3000 mbti-client
```

### Build & Run Server

```bash
docker build -t mbti-server ./server
docker run -d --name mbti-server -p 5000:5000 mbti-server
```

### Build & Run ML Model

```bash
docker build -t mbti-mlmodel ./MLmodel
docker run -d --name mbti-mlmodel -p 5001:5001 mbti-mlmodel
```

---

## 🌐 Access the Application

Open your browser and go to:
**[http://localhost:3000](http://localhost:3000)**
Enjoy the magic! ✨

---

## 📌 Notes

* Ensure MongoDB collection `mbti_chatbot` is created in **Cluster1**.
* Make sure all containers are running (`docker ps`) if app doesn't show up.
* If issues persist, go home 🏠 (manege hogu 😄).

---

Made with ❤️ for Basu Bro

```

Let me know if you also want Kannada version or deployment instructions (like Railway/Vercel etc).
```
