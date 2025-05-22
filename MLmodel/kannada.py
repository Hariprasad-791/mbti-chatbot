import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
from xgboost import XGBClassifier
from transformers import BertTokenizer, BertModel
import torch
import joblib
from tqdm import tqdm
import os

# -------------------------
# Load MBTI Dataset
# -------------------------
df = pd.read_csv("mbti_1.csv")
df = df[['posts', 'type']].dropna()

X = df['posts'].values
y = df['type'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# -------------------------
# Encode MBTI Labels
# -------------------------
label_encoder = LabelEncoder()
y_train_enc = label_encoder.fit_transform(y_train)
y_test_enc = label_encoder.transform(y_test)

# -------------------------
# Load mBERT Tokenizer and Model
# -------------------------
print("Loading mBERT model...")
tokenizer = BertTokenizer.from_pretrained("bert-base-multilingual-cased")
model = BertModel.from_pretrained("bert-base-multilingual-cased")
model.eval()

# -------------------------
# Generate [CLS] Embedding
# -------------------------
def get_cls_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()

# -------------------------
# Convert to Embeddings
# -------------------------
print("Generating mBERT embeddings for training data...")
X_train_vecs = [get_cls_embedding(text) for text in tqdm(X_train)]

print("Generating mBERT embeddings for test data...")
X_test_vecs = [get_cls_embedding(text) for text in tqdm(X_test)]

# -------------------------
# Train XGBoost Classifier
# -------------------------
print("Training XGBoost classifier...")
clf = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
clf.fit(X_train_vecs, y_train_enc)

# -------------------------
# Evaluate
# -------------------------
print("Evaluating model...")
y_pred_enc = clf.predict(X_test_vecs)
y_pred = label_encoder.inverse_transform(y_pred_enc)

acc = accuracy_score(y_test, y_pred)
print(f"\n✅ Accuracy: {acc:.4f}")
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# -------------------------
# Save Model and Tokenizer
# -------------------------
save_dir = "saved_model"
os.makedirs(save_dir, exist_ok=True)

joblib.dump(clf, os.path.join(save_dir, "mbti_xgb_mbert_model.pkl"))
joblib.dump(label_encoder, os.path.join(save_dir, "mbti_label_encoder.pkl"))
tokenizer.save_pretrained(os.path.join(save_dir, "mbert_tokenizer"))
model.save_pretrained(os.path.join(save_dir, "mbert_model"))
print("✅ Model, tokenizer, and label encoder saved in 'saved_model/' folder")

# -------------------------
# Load Everything for Prediction
# -------------------------
def load_model_for_prediction(model_dir="saved_model"):
    clf = joblib.load(os.path.join(model_dir, "mbti_xgb_mbert_model.pkl"))
    tokenizer = BertTokenizer.from_pretrained(os.path.join(model_dir, "mbert_tokenizer"))
    model = BertModel.from_pretrained(os.path.join(model_dir, "mbert_model"))
    label_encoder = joblib.load(os.path.join(model_dir, "mbti_label_encoder.pkl"))
    model.eval()
    return clf, tokenizer, model, label_encoder

# -------------------------
# Prediction Function
# -------------------------
def predict_mbti(text, clf, tokenizer, model, label_encoder):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    vec = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()
    pred_enc = clf.predict([vec])[0]
    return label_encoder.inverse_transform([pred_enc])[0]

# -------------------------
# Example Usage
# -------------------------
if __name__ == "__main__":
    clf, tokenizer, model, label_encoder = load_model_for_prediction()

    kannada_text = "ನಾನು ನನ್ನ ಒತ್ತಡವನ್ನು ಪುಸ್ತಕಗಳನ್ನು ಓದುವ ಮೂಲಕ ನಿರ್ವಹಿಸುತ್ತೇನೆ ಮತ್ತು ನನ್ನೊಳಗಿನ ಭಾವನೆಗಳನ್ನು ವ್ಯಕ್ತಪಡಿಸಲು ಬರೆಹವನ್ನು ಬಳಸುತ್ತೇನೆ."
    english_text = "I manage stress by reading books and often express myself through writing."

    print("\n🔎 Predictions:")
    print("Kannada:", predict_mbti(kannada_text, clf, tokenizer, model, label_encoder))
    print("English:", predict_mbti(english_text, clf, tokenizer, model, label_encoder))
