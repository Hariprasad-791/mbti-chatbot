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

# 🔐 Set your Gemini API key
genai.configure(api_key="AIzaSyAW6jtqfPOdYZw47DKGldo0jCTdE3V7RN8")
gemini_model = genai.GenerativeModel("gemini-2.0-flash")

# Model configuration
MAX_SEQ_LEN = 128
MBERT_MODEL_NAME = "bert-base-multilingual-cased"

# Add these imports at the top of your app.py
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import logging

# Set up logging to handle warnings
logging.getLogger("transformers").setLevel(logging.ERROR)

class EmotionContextClassifier:
    def __init__(self):
        try:
            # Use the working emotion model
            self.model_name = "j-hartmann/emotion-english-distilroberta-base"
            print(f"Loading emotion model: {self.model_name}")
            
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                clean_up_tokenization_spaces=True
            )
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name,
                return_dict=True
            )
            
            # Set model to evaluation mode
            self.model.eval()
            
            print("Emotion model loaded successfully!")
            
        except Exception as e:
            print(f"Error loading emotion model: {e}")
            print("Falling back to VADER sentiment analysis...")
            self.model = None
            self.tokenizer = None
            # Initialize VADER as fallback
            from nltk.sentiment.vader import SentimentIntensityAnalyzer
            self.vader_analyzer = SentimentIntensityAnalyzer()
        
        # Updated emotion labels for this model
        self.emotion_labels = [
            'anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise'
        ]
        
        # Enhanced emotion to context mapping
        self.emotion_to_context = {
            'stress': ['fear', 'sadness', 'anger'],
            'social_anxiety': ['fear', 'neutral', 'sadness'],
            'curiosity': ['joy', 'surprise'],
            'positive': ['joy'],
            'academic_pressure': ['fear', 'sadness', 'anger', 'disgust'],
            'emotional_support': ['sadness', 'fear', 'anger'],
            'excitement': ['joy', 'surprise']
        }
        
        # Academic-specific keywords for enhanced detection
        self.academic_keywords = {
            'exam_stress': ['exam', 'test', 'quiz', 'midterm', 'final'],
            'assignment_pressure': ['assignment', 'project', 'deadline', 'due'],
            'social_academic': ['presentation', 'group work', 'class discussion'],
            'study_issues': ['study', 'studying', 'learn', 'understand']
        }
    
    def classify_emotion(self, text):
        """Classify emotions using DistilRoBERTa with fallback"""
        if self.model is None or self.tokenizer is None:
            # Fallback to VADER-based emotion classification
            return self._fallback_emotion_classification(text)
        
        try:
            # Preprocess text
            text = text.strip()
            if not text:
                return [('neutral', 0.5)]
            
            # Tokenize and get model predictions
            inputs = self.tokenizer(
                text, 
                return_tensors="pt", 
                truncation=True, 
                max_length=128,
                padding=True
            )
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=-1).detach().numpy().flatten()
            
            # Get top 3 emotions with probabilities
            top_indices = np.argsort(probs)[-3:][::-1]
            top_emotions = [(self.emotion_labels[i], float(probs[i])) for i in top_indices]
            
            return top_emotions
            
        except Exception as e:
            print(f"Emotion classification error: {e}")
            # Fallback to VADER
            return self._fallback_emotion_classification(text)
    
    def _fallback_emotion_classification(self, text):
        """Fallback emotion classification using VADER + keywords"""
        try:
            sentiment = self.vader_analyzer.polarity_scores(text)
            text_lower = text.lower()
            
            # Enhanced keyword-based emotion detection
            if sentiment['compound'] < -0.3:
                if any(keyword in text_lower for keywords in self.academic_keywords.values() for keyword in keywords):
                    return [('fear', abs(sentiment['compound'])), ('sadness', abs(sentiment['neg'])), ('neutral', 0.1)]
                elif any(word in text_lower for word in ['angry', 'mad', 'frustrated', 'annoyed']):
                    return [('anger', abs(sentiment['compound'])), ('disgust', abs(sentiment['neg'])), ('neutral', 0.1)]
                else:
                    return [('sadness', abs(sentiment['compound'])), ('fear', abs(sentiment['neg'])), ('neutral', 0.1)]
            elif sentiment['compound'] > 0.3:
                if any(word in text_lower for word in ['curious', 'interesting', 'wow', 'amazing']):
                    return [('surprise', sentiment['compound']), ('joy', sentiment['pos']), ('neutral', 0.1)]
                else:
                    return [('joy', sentiment['compound']), ('surprise', sentiment['pos']), ('neutral', 0.1)]
            else:
                return [('neutral', 0.6), ('sadness', 0.2), ('joy', 0.2)]
                
        except Exception as e:
            print(f"Fallback emotion classification error: {e}")
            return [('neutral', 0.5)]
    def detect_positive_context(self, text, emotions):
         
         """Detect positive emotional states"""
         positive_words = ['better', 'good', 'great', 'helpful', 'amazing', 'fantastic', 'love', 'awesome', 'wonderful', 'excellent', 'wow']
         curiosity_words = ['how', 'explain', 'interesting', 'why', 'what', 'tell me', 'show me', 'can you explain']
         planning_words = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'schedule', 'then', 'first', 'next']
    
         text_lower = text.lower()
    
    # Check if it's planning/scheduling (not curiosity)
         if any(word in text_lower for word in planning_words):
            return None  # Let normal emotion detection handle it
    
    # Check for genuine curiosity (questions + positive emotions)
         curiosity_score = sum(1 for word in curiosity_words if word in text_lower)
         positive_score = sum(1 for word in positive_words if word in text_lower)
    
    # Only return curiosity if there are actual questions AND positive emotions
         if curiosity_score > 0 and (positive_score > 0 or any(emotion == 'joy' for emotion, prob in emotions if prob > 0.4)):
              return 'curiosity'
         elif positive_score > 0:
             return 'positive'
    
         return None
   
    def detect_context(self, text):
        """Enhanced context detection using emotion classification"""
        emotions = self.classify_emotion(text)
        text_lower = text.lower()
        context_scores = {}
        # Enhanced academic keyword detection
        exam_keywords = ['ಪರೀಕ್ಷೆ', 'exam', 'test', 'ಅಂತಿಮ', 'final', 'ಕಲನಶಾಸ್ತ್ರ', 'calculus', 'ರಸಾಯನಶಾಸ್ತ್ರ', 'chemistry']
        schedule_keywords = ['ಸೋಮವಾರ', 'monday', 'ಬುಧವಾರ', 'wednesday', 'ಶುಕ್ರವಾರ', 'friday', 'ಗುರುವಾರ', 'thursday']
    
    # If exam + schedule keywords, it's academic pressure, not social anxiety
        if any(word in text_lower for word in exam_keywords) and any(word in text_lower for word in schedule_keywords):
            context_scores['academic_pressure'] = context_scores.get('academic_pressure', 0) + 0.8
        # First, check for positive context using the new method
        positive_context = self.detect_positive_context(text, emotions)
        if positive_context:
            if positive_context == 'curiosity':
                context_scores['curiosity'] = context_scores.get('curiosity', 0) + 0.5
            elif positive_context == 'positive':
                context_scores['positive'] = context_scores.get('positive', 0) + 0.4
        
        # Calculate context scores based on detected emotions
        for context, emotion_list in self.emotion_to_context.items():
            score = 0
            for emotion, prob in emotions:
                if emotion in emotion_list:
                    score += prob
            context_scores[context] = context_scores.get(context, 0) + score
        
        # Enhanced academic context detection
        academic_boost = 0
        for category, keywords in self.academic_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                academic_boost += 0.2
                # Boost academic_pressure context
                if 'academic_pressure' in context_scores:
                    context_scores['academic_pressure'] += academic_boost
        
        # Get primary context
        primary_context = max(context_scores, key=context_scores.get) if context_scores else 'normal'
        primary_score = context_scores.get(primary_context, 0)
        
        # Adjust threshold based on academic content
        threshold = 0.25 if academic_boost > 0 else 0.3
        
        # Only return context if confidence is above threshold
        if primary_score > threshold:
            return {
                'primary_context': primary_context,
                'confidence': min(primary_score, 1.0),  # Cap at 1.0
                'detected_emotions': emotions,
                'all_contexts': context_scores,
                'academic_boost': academic_boost > 0
            }
        else:
            return {
                'primary_context': 'normal',
                'confidence': 0.0,
                'detected_emotions': emotions,
                'all_contexts': context_scores,
                'academic_boost': False
            }

# Add this class after EmotionContextClassifier in your app.py
class EnhancedPersonalityAdaptationEngine:
    def __init__(self):
        self.adaptation_strategies = {
            'stress': {
                'INTJ': 'structured_support',
                'ENFP': 'emotional_first',
                'ISTJ': 'step_by_step',
                'ESFP': 'positive_energy',
                'INTP': 'logical_analysis',
                'ENTJ': 'action_plan',
                'INFJ': 'deep_understanding',
                'ENTP': 'creative_alternatives',
                'ISFJ': 'gentle_reassurance',
                'ESTJ': 'systematic_approach',
                'ISFP': 'value_respect',
                'ESTP': 'immediate_action',
                'INFP': 'emotion_validation',
                'ENFJ': 'growth_focus',
                'ISTP': 'practical_solutions',
                'ESFJ': 'social_support'
            }
        }
    
    def adapt_personality(self, base_mbti, context_data):
        """Enhanced personality adaptation using emotion data"""
        primary_context = context_data.get('primary_context', 'normal')
        confidence = context_data.get('confidence', 0)
        emotions = context_data.get('detected_emotions', [])
        
        # Determine adaptation level based on confidence
        adaptation_level = 'high' if confidence > 0.7 else 'medium' if confidence > 0.4 else 'low'
        
        if primary_context == 'stress':
            return self._adapt_for_stress(base_mbti, emotions, adaptation_level)
        elif primary_context == 'social_anxiety':
            return self._adapt_for_social_anxiety(base_mbti, emotions, adaptation_level)
        elif primary_context == 'curiosity':
            return self._adapt_for_curiosity(base_mbti, emotions, adaptation_level)
        elif primary_context == 'positive':
            return self._adapt_for_positive(base_mbti, emotions, adaptation_level)
        elif primary_context == 'academic_pressure':
            return self._adapt_for_academic_pressure(base_mbti, emotions, adaptation_level)
        elif primary_context == 'emotional_support':
            return self._adapt_for_emotional_support(base_mbti, emotions, adaptation_level)
        else:
            return {'style': 'normal', 'approach': base_mbti, 'adaptation_level': 'none'}
    
    def _adapt_for_stress(self, base_mbti, emotions, level):
        dominant_emotion = emotions[0][0] if emotions else 'neutral'
        
        return {
            'style': 'supportive_structured',
            'approach': 'calm_then_solve',
            'tone': 'gentle_understanding',
            'adaptation_level': level,
            'dominant_emotion': dominant_emotion,
            'explanation': f'Adapting from {base_mbti} to provide stress-specific support (detected: {dominant_emotion})'
        }
    
    def _adapt_for_social_anxiety(self, base_mbti, emotions, level):
        return {
            'style': 'gentle_encouraging',
            'approach': 'validate_then_guide',
            'tone': 'understanding_supportive',
            'adaptation_level': level,
            'explanation': f'Adapting from {base_mbti} to address social anxiety'
        }
    
    def _adapt_for_curiosity(self, base_mbti, emotions, level):
        return {
            'style': 'exploratory_detailed',
            'approach': 'expand_and_explore',
            'tone': 'enthusiastic_informative',
            'adaptation_level': level,
            'explanation': f'Adapting from {base_mbti} to match your curiosity and excitement'
        }
    
    def _adapt_for_positive(self, base_mbti, emotions, level):
        return {
            'style': 'encouraging_supportive',
            'approach': 'build_on_positivity',
            'tone': 'warm_enthusiastic',
            'adaptation_level': level,
            'explanation': f'Adapting from {base_mbti} to match your positive energy'
        }
    
    def _adapt_for_academic_pressure(self, base_mbti, emotions, level):
        return {
            'style': 'structured_supportive',
            'approach': 'break_down_and_plan',
            'tone': 'calm_strategic',
            'adaptation_level': level,
            'explanation': f'Adapting from {base_mbti} to help with academic pressure'
        }
    
    def _adapt_for_emotional_support(self, base_mbti, emotions, level):
        return {
            'style': 'empathetic_caring',
            'approach': 'listen_then_support',
            'tone': 'warm_understanding',
            'adaptation_level': level,
            'explanation': f'Adapting from {base_mbti} to provide emotional support'
        }

# Initialize the emotion classifier globally (add this after the class definition)
try:
    emotion_classifier = EmotionContextClassifier()
    print("Emotion classifier initialized successfully!")
except Exception as e:
    print(f"Failed to initialize emotion classifier: {e}")
    emotion_classifier = None

# Update your enhanced_adaptive_generate route in app.py:

@app.route('/enhanced_adaptive_generate', methods=['POST'])
def enhanced_adaptive_generate():
    """Generate adaptive response with transformer-based emotion detection"""
    try:
        data = request.get_json()
        query = data.get("user_query", "")
        base_mbti = data.get("user_personality", "")
        chat_history = data.get("chat_history", [])
        user_language = data.get("user_language", "en")  # Add this line
        
        if not emotion_classifier:
            return jsonify({
                "error": "Emotion classifier not available",
                "response": "I'm here to support you. Please try again."
            }), 500
        
        # Enhanced context detection using transformer
        context_data = emotion_classifier.detect_context(query)
        
        # Initialize enhanced adaptation engine
        adaptation_engine = EnhancedPersonalityAdaptationEngine()
        
        # Adapt personality based on emotion-detected context
        adapted_traits = adaptation_engine.adapt_personality(base_mbti, context_data)
        
        # Create chat history string
        chat_string = "\n".join([f"User: {entry['user']}\nBot: {entry['bot']}" for entry in chat_history])
        
        # Create enhanced prompt with emotion data
        emotions_str = ", ".join([f"{emotion} ({prob:.2f})" for emotion, prob in context_data['detected_emotions']])
        
        # Language-specific prompt
        if user_language == 'kn':
            language_instruction = """
IMPORTANT: Respond in Kannada language only. Use Kannada script (ಕನ್ನಡ) for your entire response.
Examples of Kannada responses:
- ಹಾಯ್! ನೀವು ಹೇಗಿದ್ದೀರಿ?
- ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ.
- ಇದು ಸಹಾಯಕವಾಗಿದೆಯೇ?
"""
        else:
            language_instruction = "Respond in English."
        
        prompt = f"""
You are an AI companion with adaptive personality responding to a university student.

{language_instruction}

EMOTION ANALYSIS:
- Detected Emotions: {emotions_str}
- Primary Context: {context_data['primary_context']} (confidence: {context_data['confidence']:.2f})
- Academic Context: {'Yes' if context_data.get('academic_boost', False) else 'No'}
- Adaptation Level: {adapted_traits.get('adaptation_level', 'none')}

PERSONALITY ADAPTATION:
- Base Personality: {base_mbti}
- Adapted Style: {adapted_traits.get('style', 'normal')}
- Adapted Approach: {adapted_traits.get('approach', 'standard')}
- Adapted Tone: {adapted_traits.get('tone', 'balanced')}

STUDENT QUERY: {query}

CONVERSATION HISTORY:
{chat_string}

ENHANCED ADAPTATION RULES:
1. If primary context is "stress" or "academic_pressure": Provide calming support first, then structured solutions
2. If "social_anxiety" detected: Validate their social concerns, offer gentle encouragement
3. If "curiosity" or "positive": Match their enthusiasm and provide engaging explanations
4. If "emotional_support" needed: Lead with empathy before offering practical advice
5. Adapt your {base_mbti} communication style to match their current emotional needs

RESPONSE GUIDELINES:
- Keep response under 120 words
- Be conversational, not lecture-style
- Focus on 1-2 key points maximum
- Ask engaging follow-up questions
- Use natural, friendly tone
- RESPOND IN THE USER'S LANGUAGE ({user_language})

Generate a response that demonstrates this emotion-aware personality adaptation.
"""
        
        # Generate response using Gemini
        chat = gemini_model.start_chat()
        response = chat.send_message(prompt)
        
        return jsonify({
            "response": response.text.strip(),
            "adaptation_info": adapted_traits.get('explanation', ''),
            "context_data": context_data,
            "adapted_traits": adapted_traits,
            "emotion_analysis": {
                "detected_emotions": context_data['detected_emotions'],
                "primary_context": context_data['primary_context'],
                "confidence": context_data['confidence'],
                "academic_context": context_data.get('academic_boost', False)
            },
            "language": user_language  # Add this
        })
        
    except Exception as e:
        print(f"Enhanced adaptive generation error: {e}")
        error_message = "I'm here to support you. Please try again." if user_language == 'en' else "ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        return jsonify({
            "error": f"Enhanced adaptive response generation failed: {str(e)}",
            "response": error_message
        }), 500

# Add the enhanced route for emotion analysis
@app.route('/analyze_emotion', methods=['POST'])
def analyze_emotion():
    """Standalone emotion analysis endpoint"""
    try:
        data = request.get_json()
        text = data.get("text", "")
        
        if not emotion_classifier:
            return jsonify({"error": "Emotion classifier not available"}), 500
        
        context_data = emotion_classifier.detect_context(text)
        
        return jsonify({
            "emotions": context_data['detected_emotions'],
            "primary_context": context_data['primary_context'],
            "confidence": context_data['confidence'],
            "all_contexts": context_data['all_contexts'],
            "academic_context": context_data.get('academic_boost', False)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        print(text)
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

        chat = gemini_model.start_chat()
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

        chat = gemini_model.start_chat()
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
