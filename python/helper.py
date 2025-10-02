import os
import numpy as np
import pandas as pd
import re
import string
import pickle
import sys
from nltk.stem import PorterStemmer

# Initialize Porter Stemmer
ps = PorterStemmer()

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'static', 'model', 'model.pickle')
stopwords_path = os.path.join(script_dir, 'static', 'model', 'corpora', 'stopwords', 'english')
vocab_path = os.path.join(script_dir, 'static', 'model', 'vocabulary.txt')

def load_resources(silent=True):
    """Load model, stopwords, vocabulary"""
    resources = {}

    # Load model
    try:
        with open(model_path, 'rb') as f:
            resources['model'] = pickle.load(f)
        if not silent: print("✓ Model loaded successfully", file=sys.stderr)
    except Exception as e:
        if not silent: print(f"✗ Error loading model: {e}", file=sys.stderr)
        resources['model'] = None

    # Load stopwords
    try:
        with open(stopwords_path, 'r', encoding='utf-8') as file:
            resources['sw'] = file.read().splitlines()
        if not silent: print("✓ Stopwords loaded successfully", file=sys.stderr)
    except Exception as e:
        if not silent: print(f"✗ Error loading stopwords: {e}", file=sys.stderr)
        resources['sw'] = []

    # Load vocab
    try:
        vocab = pd.read_csv(vocab_path, header=None)
        resources['tokens'] = vocab[0].tolist()
        if not silent: print("✓ Vocabulary loaded successfully", file=sys.stderr)
    except Exception as e:
        if not silent: print(f"✗ Error loading vocabulary: {e}", file=sys.stderr)
        resources['tokens'] = []

    return resources

# Load once
resources = load_resources(silent=True)
model = resources['model']
sw = resources['sw']
tokens = resources['tokens']

# -------------------- Preprocessing --------------------
def remove_punctuations(text):
    for punctuation in string.punctuation:
        text = text.replace(punctuation, '')
    return text

def preprocessing(text):
    """Clean text for model"""
    data = pd.DataFrame([text], columns=['tweet'])
    data["tweet"] = data["tweet"].apply(lambda x: " ".join(x.lower() for x in x.split()))
    data["tweet"] = data['tweet'].apply(
        lambda x: " ".join(re.sub(r'^https?:\/\/.*[\r\n]*', '', x, flags=re.MULTILINE) for x in x.split())
    )
    data["tweet"] = data["tweet"].apply(remove_punctuations)
    data["tweet"] = data['tweet'].str.replace(r'\d+', '', regex=True)
    data["tweet"] = data["tweet"].apply(lambda x: " ".join(x for x in x.split() if x not in sw))
    data["tweet"] = data["tweet"].apply(lambda x: " ".join(ps.stem(x) for x in x.split()))
    return data["tweet"].iloc[0] if len(data["tweet"]) > 0 else ""

def vectorizer(ds):
    """Convert text into binary vector based on vocabulary"""
    vectorized_lst = []
    if isinstance(ds, str):
        ds = [ds]
    for sentence in ds:
        sentence_lst = np.zeros(len(tokens))
        for i in range(len(tokens)):
            if tokens[i] in sentence.split():
                sentence_lst[i] = 1
        vectorized_lst.append(sentence_lst)
    return np.asarray(vectorized_lst, dtype=np.float32)

# -------------------- Prediction --------------------
def get_prediction(vectorized_text):
    if model is None or len(vectorized_text) == 0:
        return "unknown"
    try:
        prediction = model.predict(vectorized_text)
        pred_val = prediction[0] if hasattr(prediction, "__iter__") else prediction
        return "negative" if pred_val == 1 else "positive"
    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        return "unknown"

def predict_sentiment(text):
    if not text or not text.strip():
        return "unknown"
    if model is None or len(tokens) == 0:
        return "unknown"

    try:
        processed_text = preprocessing(text)
        vectorized_text = vectorizer(processed_text)
        prediction = get_prediction(vectorized_text)
        return prediction
    except Exception as e:
        print(f"Error in prediction: {e}", file=sys.stderr)
        return "unknown"

# -------------------- CLI Entry --------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
        result = predict_sentiment(text)
        print(result)   # ✅ ONLY sentiment value goes to stdout
        sys.stdout.flush()
    else:
        # Debug mode
        resources = load_resources(silent=False)
        test_texts = [
            "I love this product! It's amazing!",
            "This is the worst experience ever.",
            "The weather is nice today.",
            "I hate waiting in long lines."
        ]
        for t in test_texts:
            print(f"{t} -> {predict_sentiment(t)}")
