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

# Get the directory where your script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct absolute paths
model_path = os.path.join(script_dir, 'static', 'model', 'model.pickle')
stopwords_path = os.path.join(script_dir, 'static', 'model', 'corpora', 'stopwords', 'english')
vocab_path = os.path.join(script_dir, 'static', 'model', 'vocabulary.txt')

def load_resources(silent=True):
    """Load all required resources with error handling"""
    resources = {}

    try:
        with open(model_path, 'rb') as f:
            resources['model'] = pickle.load(f)
        if not silent: print("[OK] Model loaded successfully")
    except FileNotFoundError:
        if not silent: print(f"[ERROR] Model file not found at: {model_path}")
        resources['model'] = None
    except Exception as e:
        if not silent: print(f"[ERROR] Error loading model: {e}")
        resources['model'] = None

    try:
        with open(stopwords_path, 'r', encoding='utf-8') as file:
            resources['sw'] = file.read().splitlines()
        if not silent: print("[OK] Stopwords loaded successfully")
    except FileNotFoundError:
        if not silent: print(f"[ERROR] Stopwords file not found at: {stopwords_path}")
        resources['sw'] = []
    except Exception as e:
        if not silent: print(f"[ERROR] Error loading stopwords: {e}")
        resources['sw'] = []

    try:
        vocab = pd.read_csv(vocab_path, header=None)
        resources['tokens'] = vocab[0].tolist()
        if not silent: print("[OK] Vocabulary loaded successfully")
    except FileNotFoundError:
        if not silent: print(f"[ERROR] Vocabulary file not found at: {vocab_path}")
        resources['tokens'] = []
    except Exception as e:
        if not silent: print(f"[ERROR] Error loading vocabulary: {e}")
        resources['tokens'] = []

    return resources


# Load resources (silent by default when imported)
resources = load_resources(silent=True)
model = resources['model']
sw = resources['sw']
tokens = resources['tokens']


def remove_punctuations(text):
    for punctuation in string.punctuation:
        text = text.replace(punctuation, '')
    return text


def preprocessing(text):
    data = pd.DataFrame([text], columns=['tweet'])
    data["tweet"] = data["tweet"].apply(lambda x: " ".join(x.lower() for x in x.split()))
    data["tweet"] = data['tweet'].apply(
        lambda x: " ".join(re.sub(r'^https?:\/\/.*[\r\n]*', '', x, flags=re.MULTILINE) for x in x.split()))
    data["tweet"] = data["tweet"].apply(remove_punctuations)
    data["tweet"] = data['tweet'].str.replace('\d+', '', regex=True)
    data["tweet"] = data["tweet"].apply(lambda x: " ".join(x for x in x.split() if x not in sw))
    data["tweet"] = data["tweet"].apply(lambda x: " ".join(ps.stem(x) for x in x.split()))
    return data["tweet"].iloc[0] if len(data["tweet"]) > 0 else ""


def vectorizer(ds):
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


def get_prediction(vectorized_text):
    if model is None:
        return "error"
    if len(vectorized_text) == 0:
        return "error"
    prediction = model.predict(vectorized_text)
    return 'negative' if prediction == 1 else 'positive'


def predict_sentiment(text):
    if not text or not text.strip():
        return "error"
    if model is None or len(tokens) == 0:
        return "error"
    try:
        processed_text = preprocessing(text)
        vectorized_text = vectorizer(processed_text)
        prediction = get_prediction(vectorized_text)
        return prediction
    except Exception:
        return "error"


# -------------------------------
# MAIN ENTRY
# -------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
        # Print ONLY the sentiment → Node backend expects a clean value
        print(predict_sentiment(text))
    else:
        # Debug mode for manual testing
        resources = load_resources(silent=False)
        print()
        if model is not None and len(tokens) > 0:
            test_texts = [
                "I love this product! It's amazing!",
                "This is the worst experience ever.",
                "The weather is nice today.",
                "I hate waiting in long lines."
            ]
            for t in test_texts:
                print(f"{t} -> {predict_sentiment(t)}")
        else:
            print("Cannot test prediction - required resources are missing.")
