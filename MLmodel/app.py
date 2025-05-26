from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from transformers import AutoTokenizer
import numpy as np
import re
import os
import google.generativeai as genai
import nltk

# Download NLTK data if needed
try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

app = Flask(__name__)
CORS(app)

# Global variables for model and tokenizer
model = None
tokenizer = None

# Configure Google Generative AI
try:
    import google.generativeai as genai
    
    GOOGLE_API_KEY = "AIzaSyAW6jtqfPOdYZw47DKGldo0jCTdE3V7RN8"
    genai.configure(api_key=GOOGLE_API_KEY)
    
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-pro')
        # Test the model
        response = model.generate_content("Test message")
        if response:
            print("✅ Gemini model initialized successfully!")
        else:
            raise Exception("Model response validation failed")
            
    except Exception as e:
        print(f"❌ Error initializing Gemini model: {str(e)}")
        print("💡 Make sure you:")
        print("   1. Have a valid API key")
        print("   2. Have internet connectivity")
        print("   3. Are using the correct model name (gemini-pro)")
        exit(1)

except ImportError:
    print("❌ Error: Could not import google.generativeai")
    print("💡 Try running: pip install --upgrade google-generativeai")
    exit(1)

# Model configuration
MAX_SEQ_LEN = 128
MBERT_MODEL_NAME = "bert-base-multilingual-cased"

def load_mbert_model():
    """Load the trained mBERT model and tokenizer"""
    global model, tokenizer
    
    try:
        # Load your trained mBERT model
        model_path = os.path.join(os.path.dirname(__file__), 'mbert_mbti_model', 'complete_model')
        model = tf.keras.models.load_model(model_path)
        
        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(MBERT_MODEL_NAME)
        
        print("✅ mBERT model and tokenizer loaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Error loading mBERT model: {e}")
        print("Expected model structure:")
        print("mbert_mbti_model/complete_model/ (TensorFlow SavedModel format)")
        return False

def preprocess_text(text):
    """Clean and preprocess input text"""
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    # Remove numbers
    text = re.sub(r'\d+', '', text)
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def predict_personality_mbert(text, max_length=MAX_SEQ_LEN):
    """Predict MBTI personality type using mBERT model"""
    global model, tokenizer
    
    if model is None or tokenizer is None:
        return None
    
    try:
        # Preprocess text
        cleaned_text = preprocess_text(text)
        
        if not cleaned_text:
            return {
                'error': 'Empty or invalid text provided',
                'mbti': 'UNKNOWN',
                'confidence': 0.0
            }
        
        # Tokenize the text
        inputs = tokenizer(
            cleaned_text,
            padding='max_length',
            truncation=True,
            max_length=max_length,
            return_tensors='tf',
            return_attention_mask=True,
            return_token_type_ids=True
        )
        
        # Make prediction
        prediction = model.predict({
            'input_ids': inputs['input_ids'],
            'attention_mask': inputs['attention_mask'],
            'token_type_ids': inputs['token_type_ids']
        }, verbose=0)
        
        # Convert predictions to MBTI type
        probs = prediction[0]
        
        # Map probabilities to MBTI dimensions
        mbti_type = ""
        mbti_type += "E" if probs[0] > 0.5 else "I"  # Extraversion vs Introversion
        mbti_type += "S" if probs[1] > 0.5 else "N"  # Sensing vs Intuition
        mbti_type += "F" if probs[2] > 0.5 else "T"  # Feeling vs Thinking
        mbti_type += "P" if probs[3] > 0.5 else "J"  # Perceiving vs Judging
        
        # Calculate overall confidence
        confidence = float(np.mean(np.abs(probs - 0.5) * 2))
        
        return {
            'mbti': mbti_type,
            'confidence': confidence,
            'probabilities': {
                'E_I': float(probs[0]),  # >0.5 = E, <0.5 = I
                'S_N': float(probs[1]),  # >0.5 = S, <0.5 = N
                'F_T': float(probs[2]),  # >0.5 = F, <0.5 = T
                'P_J': float(probs[3])   # >0.5 = P, <0.5 = J
            },
            'dimensions': {
                'Extraversion': float(probs[0]),
                'Sensing': float(probs[1]),
                'Feeling': float(probs[2]),
                'Perceiving': float(probs[3])
            }
        }
        
    except Exception as e:
        print(f"mBERT prediction error: {e}")
        return {
            'error': f'Prediction failed: {str(e)}',
            'mbti': 'UNKNOWN',
            'confidence': 0.0
        }

@app.route('/predict', methods=['POST'])
def predict():
    """Main endpoint for personality prediction using mBERT"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'No text provided',
                'mbti': 'UNKNOWN'
            }), 400
        
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({
                'error': 'Empty text provided',
                'mbti': 'UNKNOWN'
            }), 400
        
        # Predict personality using mBERT
        result = predict_personality_mbert(text)
        
        if result is None:
            return jsonify({
                'error': 'mBERT model not loaded',
                'mbti': 'UNKNOWN'
            }), 500
        
        # Add additional information to result
        result['original_text'] = text
        result['processed_text'] = preprocess_text(text)
        result['model_type'] = 'mBERT'
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}',
            'mbti': 'UNKNOWN'
        }), 500

@app.route('/generate', methods=['POST'])
def generate_response():
    """Generate personalized response using Gemini"""
    from nltk.sentiment.vader import SentimentIntensityAnalyzer
    
    try:
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
You are a personality-aware AI assistant responding to a user with {mbti} personality type.

User Query: {query}
User Emotion: {emotion}
User Personality: {mbti}
Chat History:
{chat_string}

Generate a response that is:
- Emotionally aware and aligns with the user's emotional tone
- Tailored to the {mbti} personality type characteristics
- Contextually aware, referencing relevant past conversations where possible
- Helpful and supportive

Personality-specific guidelines:
- For Introverts (I): Be thoughtful, give them space to process
- For Extraverts (E): Be energetic, encourage social interaction
- For Sensors (S): Be practical, focus on concrete details
- For Intuitives (N): Be creative, explore possibilities
- For Thinkers (T): Be logical, provide clear reasoning
- For Feelers (F): Be empathetic, consider emotional impact
- For Judgers (J): Be organized, provide structure
- For Perceivers (P): Be flexible, keep options open
"""

        chat = model.start_chat()
        response = chat.send_message(prompt)

        return jsonify({ 
            "response": response.text.strip(),
            "personality_used": mbti,
            "emotion_detected": emotion
        })
    
    except Exception as e:
        return jsonify({
            "error": f"Response generation failed: {str(e)}",
            "response": "I'm sorry, I'm having trouble generating a response right now."
        }), 500

@app.route('/summarize', methods=['POST'])
def summarize():
    """Summarize personality assessment responses"""
    try:
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
            "You will receive a list of question-and-answer pairs reflecting a person's preferences and behaviors. "
            "Your task is to write a comprehensive but concise summary that captures their overall personality "
            "across emotional, social, cognitive, and behavioral dimensions. "
            "Balance logic, creativity, structure, spontaneity, emotions, and interpersonal style. "
            "Provide insights into their decision-making process, communication style, and work preferences.\n\n"
        )

        for i, (q, a) in enumerate(zip(questions, answers), start=1):
            prompt += f"Q{i}: {q}\nA{i}: {a}\n"

        prompt += "\nProvide a personality summary (2-3 sentences):"

        chat = model.start_chat()
        response = chat.send_message(prompt)
        summary_text = response.text.strip()

        return jsonify({ "summary": summary_text })

    except Exception as e:
        print("Gemini summarization error:", str(e))
        return jsonify({
            "error": "Summarization failed",
            "details": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model is not None else "not_loaded"
    tokenizer_status = "loaded" if tokenizer is not None else "not_loaded"
    
    return jsonify({
        'status': 'healthy',
        'model_status': model_status,
        'tokenizer_status': tokenizer_status,
        'model_type': 'mBERT'
    })

@app.route('/model_info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({'error': 'mBERT model not loaded'}), 500
    
    try:
        return jsonify({
            'model_type': 'mBERT for MBTI Classification',
            'input_shape': 'Multiple inputs (input_ids, attention_mask, token_type_ids)',
            'max_sequence_length': MAX_SEQ_LEN,
            'supported_languages': ['English', 'Kannada'],
            'mbti_dimensions': ['E/I', 'S/N', 'F/T', 'P/J'],
            'total_params': model.count_params() if hasattr(model, 'count_params') else 'Unknown'
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get model info: {str(e)}'}), 500

# Initialize the model when the app starts
if __name__ == '__main__':
    print("🚀 Starting Flask server with mBERT model...")
    print("📁 Expected model structure:")
    print("   mbert_mbti_model/complete_model/ (TensorFlow SavedModel format)")
    
    success = load_mbert_model()
    
    if success:
        print("✅ mBERT model loaded successfully!")
        print("🌐 Server starting on http://localhost:5001")
        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        print("❌ Failed to load mBERT model. Please check your model files.")
        print("📋 Make sure you have:")
        print("   1. mbert_mbti_model/complete_model/ directory")
        print("   2. TensorFlow SavedModel files inside")
        print("   3. Proper file permissions")
        exit(1)
