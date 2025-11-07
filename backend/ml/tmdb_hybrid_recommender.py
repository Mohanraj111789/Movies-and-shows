# backend/ml/tmdb_hybrid_recommender.py

import time
import random
import re
import requests
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# ----------------------------
# 🔑 TMDB API Configuration
# ----------------------------
API_KEY = "61db8a0327aff8a8e4b9fe5b53623000"
BASE_URL = "https://api.themoviedb.org/3"

# ----------------------------
# 🔹 Text Preprocessing
# ----------------------------
def preprocess_text(text):
    """Clean and normalize text for better similarity matching"""
    if not text or not isinstance(text, str):
        return ""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def calculate_string_similarity(str1, str2):
    """Calculate character-level similarity between two strings"""
    if not str1 or not str2:
        return 0.0
    
    # Exact match
    if str1 == str2:
        return 1.0
    
    # Calculate Jaccard similarity on character trigrams
    def get_char_ngrams(s, n=3):
        s = ' ' + s + ' '  # Add padding
        return set(s[i:i+n] for i in range(len(s) - n + 1))
    
    ngrams1 = get_char_ngrams(str1)
    ngrams2 = get_char_ngrams(str2)
    
    if not ngrams1 or not ngrams2:
        return 0.0
    
    intersection = len(ngrams1 & ngrams2)
    union = len(ngrams1 | ngrams2)
    
    return intersection / union if union > 0 else 0.0

# ----------------------------
# 🔹 Fetch Genre List (Safe)
# ----------------------------
def get_genre_dict():
    """Fetch all genre IDs and names from TMDB"""
    try:
        url = f"{BASE_URL}/genre/movie/list?api_key={API_KEY}&language=en-US"
        res = requests.get(url, timeout=10)
        data = res.json()
        if "genres" in data:
            print("✅ Genre list fetched successfully.")
            return {g["id"]: g["name"] for g in data["genres"]}
        print("⚠️ Genre data missing in TMDB response.")
        return {}
    except Exception as e:
        print("⚠️ Failed to fetch genre list:", e)
        return {}

GENRE_MAP = get_genre_dict()

# ----------------------------
# 🔹 Fetch Movie Keywords (Fast)
# ----------------------------
def get_movie_keywords(movie_id):
    """Fetch keywords for a movie (single attempt for speed)"""
    try:
        url = f"{BASE_URL}/movie/{movie_id}/keywords?api_key={API_KEY}"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            return [kw["name"] for kw in data.get("keywords", [])]
    except Exception as e:
        pass  # Silently skip failed requests for speed
    return []

# ----------------------------
# 🔹 Fetch Popular Movies (Safe)
# ----------------------------
def fetch_movies_from_tmdb(pages=3):
    """Fetch popular movies from TMDB API safely"""
    all_movies = []
    for page in range(1, pages + 1):
        try:
            url = f"{BASE_URL}/movie/popular?api_key={API_KEY}&language=en-US&page={page}"
            res = requests.get(url, timeout=10)
            if res.status_code == 200:
                page_movies = res.json().get("results", [])
                all_movies.extend(page_movies)
                print(f"✅ Fetched page {page} ({len(all_movies)} movies total)")
            else:
                print(f"⚠️ Failed to fetch page {page}: {res.status_code}")
        except Exception as e:
            print(f"⚠️ Error fetching page {page}: {e}")
        time.sleep(random.uniform(1.0, 2.5))  # slow down to avoid rate limit
    return all_movies

# ----------------------------
# 🔹 Prepare Dataset
# ----------------------------
def prepare_dataset():
    """Fetch and prepare the TMDB movie dataset"""
    print("📡 Fetching movie data from TMDB...")
    movies = fetch_movies_from_tmdb(pages=3)  # Fetch ~60 movies
    df = pd.DataFrame(movies)

    # Validate TMDB response structure
    if not all(col in df.columns for col in ["id", "title", "overview", "genre_ids"]):
        raise Exception("❌ Missing required fields in TMDB API response")

    df = df[["id", "title", "overview", "genre_ids"]].dropna(subset=["title", "overview"])
    print(f"✅ {len(df)} movies fetched successfully.")

    print("🔍 Fetching genres and keywords for each movie...")
    df["genres"] = df["genre_ids"].apply(
        lambda ids: " ".join([GENRE_MAP.get(i, "") for i in ids if i in GENRE_MAP])
    )
    df["keywords"] = df["id"].apply(lambda mid: " ".join(get_movie_keywords(mid)))

    # Preprocess and combine text fields with higher weighting for better matching
    # Title gets repeated 5x for higher importance in similarity
    df["combined"] = (
        (df["title"].fillna("") + " ") * 5 +  # Title weight: 5x (increased)
        df["overview"].fillna("") + " " +
        (df["genres"].fillna("") + " ") * 4 +  # Genre weight: 4x (increased)
        (df["keywords"].fillna("") + " ") * 2  # Keyword weight: 2x
    )
    
    # Apply preprocessing to combined text
    df["combined"] = df["combined"].apply(preprocess_text)
    
    # Store original title for fuzzy matching
    df["title_processed"] = df["title"].apply(preprocess_text)

    print("✅ Dataset prepared for training.")
    return df

# ----------------------------
# 🔹 Build TF-IDF Model
# ----------------------------
def build_model():
    """Build TF-IDF model for similarity with optimized parameters"""
    df = prepare_dataset()
    
    # Enhanced TF-IDF configuration with character n-grams for better name matching
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,  # Limit features to most important terms
        ngram_range=(1, 3),  # Use unigrams, bigrams, and trigrams
        analyzer='word',  # Word-level analysis
        min_df=1,  # Minimum document frequency
        max_df=0.85,  # Maximum document frequency (ignore too common terms)
        sublinear_tf=True,  # Use sublinear term frequency scaling
        token_pattern=r'\b\w+\b'  # Better tokenization
    )
    
    tfidf_matrix = vectorizer.fit_transform(df["combined"])
    print(f"🤖 TF-IDF model built successfully with {tfidf_matrix.shape[1]} features.")
    return df, vectorizer, tfidf_matrix

# ----------------------------
# 🔹 Initialize Model
# ----------------------------
print("⏳ Initializing TMDB recommender model...")
movies_df, vectorizer, tfidf_matrix = build_model()
print("✅ Model ready for recommendations!\n")

# ----------------------------
# 🔹 Recommendation Logic with Enhanced Similarity
# ----------------------------
def get_recommendations(query, top_n=5):
    """Return top N movie recommendations with hybrid similarity scoring"""
    # Preprocess the query for consistent matching
    processed_query = preprocess_text(query)
    query_words = set(processed_query.split())
    
    # Transform query to TF-IDF vector
    query_vector = vectorizer.transform([processed_query])
    
    # Calculate base cosine similarity
    base_similarity = cosine_similarity(query_vector, tfidf_matrix).flatten()
    
    # Hybrid scoring: Boost scores based on multiple factors
    hybrid_scores = base_similarity.copy()
    
    for i in range(len(movies_df)):
        movie = movies_df.iloc[i]
        boost = 0.0
        
        # 1. Enhanced Title matching with multiple strategies
        title_processed = movie["title_processed"]
        title_words = set(title_processed.split())
        
        # Strategy A: Exact title match
        if processed_query == title_processed:
            boost += 0.7  # Increased from 0.5
        
        # Strategy B: Character-level similarity (handles typos, partial names)
        char_similarity = calculate_string_similarity(processed_query, title_processed)
        if char_similarity > 0.5:
            boost += 0.5 * char_similarity  # Up to 0.5 boost
        
        # Strategy C: Word overlap in title
        if query_words & title_words:
            overlap_ratio = len(query_words & title_words) / max(len(query_words), 1)
            boost += 0.4 * overlap_ratio  # Increased from 0.3
        
        # Strategy D: Substring match (one contains the other)
        if processed_query in title_processed:
            # Query is substring of title
            boost += 0.35
        elif title_processed in processed_query:
            # Title is substring of query
            boost += 0.3
        
        # Strategy E: First word match (important for movie names)
        query_first_word = processed_query.split()[0] if processed_query.split() else ""
        title_first_word = title_processed.split()[0] if title_processed.split() else ""
        if query_first_word and query_first_word == title_first_word and len(query_first_word) > 2:
            boost += 0.25
        
        # 2. Genre match boost
        movie_genres = set(movie["genres"].lower().split()) if movie["genres"] else set()
        if movie_genres & query_words:
            # Direct genre match in query
            genre_overlap = len(movie_genres & query_words)
            boost += 0.25 * genre_overlap
        
        # 3. Keyword match boost
        movie_keywords = set(movie["keywords"].lower().split()) if movie["keywords"] else set()
        if movie_keywords & query_words:
            keyword_overlap = len(movie_keywords & query_words)
            boost += 0.15 * min(keyword_overlap, 2)  # Cap at 2 keywords
        
        # Apply boost to hybrid score (allow scores > 1.0 for very strong matches)
        hybrid_scores[i] = base_similarity[i] + boost
    
    # Get top N indices based on hybrid scores
    top_indices = hybrid_scores.argsort()[-top_n:][::-1]
    
    results = []
    for i in top_indices:
        movie = movies_df.iloc[i]
        score = float(hybrid_scores[i])
        
        # Include results with any positive score
        if score > 0.0:
            results.append({
                "title": movie["title"],
                "overview": movie["overview"],
                "genres": movie["genres"].split() if movie["genres"] else [],
                "keywords": movie["keywords"].split() if movie["keywords"] else [],
                "similarity_score": round(score, 4),
                "base_score": round(float(base_similarity[i]), 4)
            })
    
    if not results:
        print(f"⚠️ No matches found for query: '{query}'")
    
    return results

# ----------------------------
# 🔹 Flask Endpoint
# ----------------------------
@app.route("/recommend", methods=["POST"])
def recommend():
    """Flask API endpoint to get movie recommendations"""
    data = request.get_json()
    query = data.get("query", "").strip()
    top_n = data.get("top_n", 5)

    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    # Validate top_n parameter
    try:
        top_n = int(top_n)
        if top_n < 1 or top_n > 20:
            top_n = 5
    except (ValueError, TypeError):
        top_n = 5

    recommendations = get_recommendations(query, top_n=top_n)
    
    return jsonify({
        "query": query,
        "processed_query": preprocess_text(query),
        "total_results": len(recommendations),
        "recommendations": recommendations
    })


if __name__ == "__main__":
    app.run(port=5001, debug=True)
