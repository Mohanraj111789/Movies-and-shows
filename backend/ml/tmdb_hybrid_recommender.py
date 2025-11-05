# backend/ml/tmdb_hybrid_recommender.py

import time
import random
import requests
import pandas as pd
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
# 🔹 Fetch Movie Keywords (Safe with Retry)
# ----------------------------
def get_movie_keywords(movie_id, retries=3):
    """Fetch keywords for a movie with retry logic"""
    for attempt in range(retries):
        try:
            url = f"{BASE_URL}/movie/{movie_id}/keywords?api_key={API_KEY}"
            res = requests.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return [kw["name"] for kw in data.get("keywords", [])]
            else:
                print(f"⚠️ Failed to fetch keywords for {movie_id}: {res.status_code}")
        except Exception as e:
            print(f"⚠️ Error fetching keywords for {movie_id}, retry {attempt+1}/{retries}: {e}")
            time.sleep(random.uniform(1.0, 2.0))  # wait before retry
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

    # Combine everything into one text field
    df["combined"] = (
        df["title"].fillna("") + " " +
        df["overview"].fillna("") + " " +
        df["genres"].fillna("") + " " +
        df["keywords"].fillna("")
    )

    print("✅ Dataset prepared for training.")
    return df

# ----------------------------
# 🔹 Build TF-IDF Model
# ----------------------------
def build_model():
    """Build TF-IDF model for similarity"""
    df = prepare_dataset()
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(df["combined"])
    print("🤖 TF-IDF model built successfully.")
    return df, vectorizer, tfidf_matrix

# ----------------------------
# 🔹 Initialize Model
# ----------------------------
print("⏳ Initializing TMDB recommender model...")
movies_df, vectorizer, tfidf_matrix = build_model()
print("✅ Model ready for recommendations!\n")

# ----------------------------
# 🔹 Recommendation Logic
# ----------------------------
def get_recommendations(query, top_n=5):
    """Return top N movie recommendations for a query"""
    query_vector = vectorizer.transform([query])
    similarity_scores = cosine_similarity(query_vector, tfidf_matrix).flatten()
    top_indices = similarity_scores.argsort()[-top_n:][::-1]

    results = []
    for i in top_indices:
        movie = movies_df.iloc[i]
        results.append({
            "title": movie["title"],
            "genres": movie["genres"].split(),
            "keywords": movie["keywords"].split(),
            "score": round(float(similarity_scores[i]), 3)
        })
    return results

# ----------------------------
# 🔹 Flask Endpoint
# ----------------------------
@app.route("/recommend", methods=["POST"])
def recommend():
    """Flask API endpoint to get movie recommendations"""
    data = request.get_json()
    query = data.get("query", "").strip()

    if not query:
        return jsonify({"error": "No query provided"}), 400

    recommendations = get_recommendations(query)
    return jsonify({
        "query": query,
        "recommendations": recommendations
    })

# ----------------------------
# 🔹 Run Flask App
# ----------------------------
if __name__ == "__main__":
    app.run(port=5001, debug=True)
