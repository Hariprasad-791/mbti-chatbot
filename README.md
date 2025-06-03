# mbti-chatbot for basu bro

ha basu bro 
step 1: MLmodel folder alli mber_mbti_model download from https://drive.google.com/drive/u/1/folders/1GCbQpHecIuy214lQBHmxo18mPGfo8LAJ
step 2: server folder alli 
put .env file 
hogu mongodb ge mbti_chatbot collection madu in cluster1
MONGO_URI=mongodb+srv://<username>:<password>@cluster1.g7off7p.mongodb.net/mbti_chatbot?retryWrites=true&w=majority&appName=Cluster1
JWT_SECRET=your_jwt_secret_key  # Replace with a real secret!
JWT_EXPIRES_IN=2h
HUGGINGFACE_API_KEY=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
GEMINI_API_KEY=AIzaSyCyDX3odpd7x4aRqQev07578y3s1hCLY3w


in root folder 
 docker build -t mbti-client ./client
  docker run -d --name mbti-client -p 3000:3000 mbti-client

   docker build -t mbti-server ./server
    docker run -d --name mbti-server -p 5000:5000 mbti-server

docker build -t mbti-mlmodel ./MLmodel
 docker run -d --name mbti-mlmodel -p 5001:5001  mbti-mlmodel               

 ega hogu localhost:3000 and see magic 
 ega bandilla andru manege hogu