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

def load_resources():
    """Load all required resources with error handling"""
    resources = {}

    try:
        # Load model
        with open(model_path, 'rb') as f:
            resources['model'] = pickle.load(f)
        print("✓ Model loaded successfully", file=sys.stderr)
    except FileNotFoundError:
        print(f"✗ Model file not found at: {model_path}", file=sys.stderr)
        resources['model'] = None
    except Exception as e:
        print(f"✗ Error loading model: {e}", file=sys.stderr)
        resources['model'] = None
    
    try:
        # Load stopwords
        with open(stopwords_path, 'r', encoding='utf-8') as file:
            resources['sw'] = file.read().splitlines()
        print("✓ Stopwords loaded successfully", file=sys.stderr)
    except FileNotFoundError:
        print(f"✗ Stopwords file not found at: {stopwords_path}", file=sys.stderr)
        resources['sw'] = []
    except Exception as e:
        print(f"✗ Error loading stopwords: {e}", file=sys.stderr)
        resources['sw'] = []
    
    try:
        # Load tokens
        vocab = pd.read_csv(vocab_path, header=None)
        resources['tokens'] = vocab[0].tolist()
        print("✓ Vocabulary loaded successfully", file=sys.stderr)
    except FileNotFoundError:
        print(f"✗ Vocabulary file not found at: {vocab_path}", file=sys.stderr)
        resources['tokens'] = []
    except Exception as e:
        print(f"✗ Error loading vocabulary: {e}", file=sys.stderr)
        resources['tokens'] = []
    
    return resources

# Load all resources
resources = load_resources()
model = resources['model']
sw = resources['sw']
tokens = resources['tokens']

def remove_punctuations(text):
    """Remove punctuation from text"""
    for punctuation in string.punctuation:
        text = text.replace(punctuation, '')
    return text

def preprocessing(text):
    """Preprocess the input text"""
    data = pd.DataFrame([text], columns=['tweet'])
    
    # Convert to lowercase
    data["tweet"] = data["tweet"].apply(lambda x: " ".join(x.lower() for x in x.split()))
    
    # Remove URLs
    data["tweet"] = data['tweet'].apply(lambda x: " ".join(re.sub(r'^https?:\/\/.*[\r\n]*', '', x, flags=re.MULTILINE) for x in x.split()))
    
    # Remove punctuations
    data["tweet"] = data["tweet"].apply(remove_punctuations)
    
    # Remove numbers
    data["tweet"] = data['tweet'].str.replace('\d+', '', regex=True)
    
    # Remove stopwords
    data["tweet"] = data["tweet"].apply(lambda x: " ".join(x for x in x.split() if x not in sw))
    
    # Apply stemming
    data["tweet"] = data["tweet"].apply(lambda x: " ".join(ps.stem(x) for x in x.split()))
    
    return data["tweet"].iloc[0] if len(data["tweet"]) > 0 else ""

def vectorizer(ds):
    """Convert text to vector representation"""
    vectorized_lst = []
    
    if isinstance(ds, str):
        # Handle single string input
        ds = [ds]
    
    for sentence in ds:
        sentence_lst = np.zeros(len(tokens))
        for i in range(len(tokens)):
            if tokens[i] in sentence.split():
                sentence_lst[i] = 1  
        vectorized_lst.append(sentence_lst)
    
    vectorized_lst_new = np.asarray(vectorized_lst, dtype=np.float32)
    return vectorized_lst_new

def get_prediction(vectorized_text):
    """Get prediction from the model"""
    if model is None:
        return "Error: Model not loaded"
    
    if len(vectorized_text) == 0:
        return "Error: No text to predict"
    
    try:
        prediction = model.predict(vectorized_text)
        # Handle both single prediction and array of predictions
        if hasattr(prediction, '__iter__') and not isinstance(prediction, str):
            prediction_value = prediction[0] if len(prediction) > 0 else prediction
        else:
            prediction_value = prediction
            
        if prediction_value == 1:
            return 'negative'
        else:
            return 'positive'
    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        return 'positive'  # Default fallback

def predict_sentiment(text):
    """Main function to predict sentiment of text"""
    print(f"DEBUG: Original text: '{text}'", file=sys.stderr)
    
    if not text or not text.strip():
        print("DEBUG: Empty text input", file=sys.stderr)
        return "positive"  # Default to positive for empty text
    
    if model is None:
        print("DEBUG: Model not loaded", file=sys.stderr)
        return "positive"
    
    if len(tokens) == 0:
        print("DEBUG: Vocabulary not loaded", file=sys.stderr)
        return "positive"
    
    try:
        # Preprocess text
        processed_text = preprocessing(text)
        print(f"DEBUG: Processed text: '{processed_text}'", file=sys.stderr)
        
        # Vectorize text
        vectorized_text = vectorizer(processed_text)
        print(f"DEBUG: Vector shape: {vectorized_text.shape}", file=sys.stderr)
        
        # Get prediction
        prediction = get_prediction(vectorized_text)
        print(f"DEBUG: Final prediction: {prediction}", file=sys.stderr)
        
        return prediction
    except Exception as e:
        print(f"DEBUG: Exception during prediction: {str(e)}", file=sys.stderr)
        return "positive"  # Default fallback

# Example usage and test function
def test_prediction():
    """Test the sentiment prediction with example texts"""
    test_texts = [
        "I love this product! It's amazing!",
        "This is the worst experience ever.",
        "The weather is nice today.",
        "I hate waiting in long lines.",
        "This is terrible and awful.",
        "Excellent and wonderful product!"
    ]
    
    print("Testing sentiment prediction:", file=sys.stderr)
    print("-" * 50, file=sys.stderr)
    
    for i, text in enumerate(test_texts, 1):
        result = predict_sentiment(text)
        print(f"Test {i}:", file=sys.stderr)
        print(f"Text: {text}", file=sys.stderr)
        print(f"Sentiment: {result}", file=sys.stderr)
        print("-" * 30, file=sys.stderr)

# File existence checker
def check_file_existence():
    """Check if all required files exist"""
    files_to_check = {
        'Model': model_path,
        'Vocabulary': vocab_path,
        'Stopwords': stopwords_path
    }
    
    print("Checking required files:", file=sys.stderr)
    print("=" * 50, file=sys.stderr)
    
    all_exist = True
    for name, path in files_to_check.items():
        exists = os.path.exists(path)
        status = "✓ FOUND" if exists else "✗ NOT FOUND"
        print(f"{name:12} {status:12} {path}", file=sys.stderr)
        if not exists:
            all_exist = False
    
    print("=" * 50, file=sys.stderr)
    if all_exist:
        print("All files are available!", file=sys.stderr)
    else:
        print("Some files are missing. Please check the paths.", file=sys.stderr)
    
    return all_exist

if __name__ == "__main__":
    # If arguments are passed, run sentiment prediction
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
        result = predict_sentiment(text)
        print(result)  # Print ONLY the result to stdout
        sys.stdout.flush()  # Force flush the output
    else:
        # Otherwise, run default checks/tests 
        check_file_existence()
        print()
        
        if model is not None and len(tokens) > 0:
            test_prediction()
        else:
            print("Cannot test prediction - required resources are missing.")