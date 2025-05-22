import os
import pandas as pd
import numpy as np
import torch
from tqdm import tqdm
from transformers import BertTokenizer, BertModel
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

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
print("Loading mBERT tokenizer and model...")
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
    cls_embedding = outputs.last_hidden_state[:, 0, :]  # CLS token
    return cls_embedding.squeeze().cpu().numpy()

# -------------------------
# Convert to Embeddings
# -------------------------
print("Generating mBERT embeddings for training data...")
X_train_vecs = [get_cls_embedding(text) for text in tqdm(X_train)]

print("Generating mBERT embeddings for test data...")
X_test_vecs = [get_cls_embedding(text) for text in tqdm(X_test)]

# -------------------------
# Save Embeddings
# -------------------------
np.save("X_train_vecs.npy", np.array(X_train_vecs))
np.save("X_test_vecs.npy", np.array(X_test_vecs))

print("✅ Saved X_train_vecs.npy and X_test_vecs.npy successfully.")
