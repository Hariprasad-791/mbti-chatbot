from flask import Flask, request, jsonify
import pickle
import re
import os
import numpy as np
import xgboost
print(xgboost.__version__)
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
# File paths (models must be in the same folder as this script)
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'tfidf_vectorizer.pkl')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'xgb_model.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), 'mbti_label_encoder.pkl')
import google.generativeai as genai
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Existing ML setup here...

# 🔐 Set your Gemini API key
genai.configure(api_key="AIzaSyAW6jtqfPOdYZw47DKGldo0jCTdE3V7RN8")
gemini_model = genai.GenerativeModel("gemini-2.0-flash")
import nltk
try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

# Load models
try:
    with open(VECTORIZER_PATH, 'rb') as f:
        vectoriz = pickle.load(f)
    print("Vectorizer loaded successfully.")

    with open(MODEL_PATH, 'rb') as f:
        modelxgb = pickle.load(f)
    print("Model loaded successfully.")

    with open(ENCODER_PATH, 'rb') as f:
        encod = pickle.load(f)
    print("Encoder loaded successfully.")
except Exception as e:
    print("Error loading models:", e)
    vectoriz = None
    modelxgb = None
    encod = None

def preprocess_text(text):
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()
    return text

@app.route('/predict', methods=['POST'])
def predict():
    if None in [vectoriz, modelxgb, encod]:
        return jsonify({"error": "Model components not loaded."}), 500
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    sample_text = data['text']
    processed_text = preprocess_text(sample_text)
    print(processed_text)
    X = vectoriz.transform([processed_text])
    print(X)
    try:
        prediction = modelxgb.predict(X)
        print("h2")
        mbti_type = encod.inverse_transform(prediction)[0]

        return jsonify({
            "original": sample_text,
            "processed": processed_text,
            "mbti_numeric": int(prediction[0]),
            "mbti": mbti_type
        })
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

@app.route('/generate', methods=['POST'])
def generate_response():
    from nltk.sentiment.vader import SentimentIntensityAnalyzer
    import google.generativeai as genai

    data = request.get_json()
    query = data.get("user_query", "")
    mbti = data.get("user_personality", "")
    chat_history = data.get("chat_history", [])

    chat_string = "\n".join([f"User: {entry['user']}\nBot: {entry['bot']}" for entry in chat_history])

    sid = SentimentIntensityAnalyzer()
    sentiment = sid.polarity_scores(query)
    emotion = (
        "positive" if sentiment['compound'] > 0.05 else
        "negative" if sentiment['compound'] < -0.05 else
        "neutral"
    )

    prompt = f"""
User Query: {query}
User Emotion: {emotion}
User Personality: {mbti}
Chat History:
{chat_string}

Generate a response that is:
- Emotionally aware and aligns with the user's emotional tone.
- Tailored to the user's personality.
- Contextually aware, referencing relevant past conversations where possible.
"""

    model = genai.GenerativeModel("gemini-2.0-flash")
    chat = model.start_chat()
    response = chat.send_message(prompt)

    return jsonify({ "response": response.text.strip() })


@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    questions = data.get("questions")
    answers = data.get("answers")

    # Validate input
    if not questions or not answers or len(questions) != len(answers):
        return jsonify({
            "error": "Both 'questions' and 'answers' are required and must be of equal length."
        }), 400

    prompt = (
    "You are a personality analysis AI trained to summarize MBTI-style responses. "
    "You will receive a list of 10 question-and-answer pairs reflecting a person's preferences and behaviors. "
    "Your task is to write a single sentence that captures their overall personality across emotional, social, cognitive, and behavioral dimensions. "
    "Make sure to balance logic, creativity, structure, spontaneity, emotions, and interpersonal style. "
    "Avoid biasing the summary toward strictly logical or structured traits — instead, reflect the true diversity of the responses.\n\n"
    )

    for i, (q, a) in enumerate(zip(questions, answers), start=1):
        prompt += f"Q{i}: {q}\nA{i}: {a}\n"

    prompt += "\nSummary (1 sentence):"


    try:
        chat = gemini_model.start_chat()
        response = chat.send_message(prompt)
        summary_text = response.text.strip()

        return jsonify({ "summary": summary_text })

    except Exception as e:
        print("Gemini error:", str(e))
        return jsonify({
            "error": "Gemini summarization failed",
            "details": str(e)
        }), 500



@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok" if all([vectoriz, modelxgb, encod]) else "error"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

