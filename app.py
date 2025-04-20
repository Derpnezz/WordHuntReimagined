from flask import Flask, render_template, jsonify, request, session, make_response
import random
import numpy as np
import secrets
from game_utils import load_dictionary, is_valid_word
import logging
from functools import wraps
from datetime import datetime, timedelta

# Configure logging with debug level for better debugging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

# Cache configuration
STATIC_CACHE_TIMEOUT = 604800  # 1 week in seconds

def add_cache_headers(response):
    """Add cache headers to the response"""
    if request.path.startswith('/static/'):
        response.cache_control.public = True
        response.cache_control.max_age = STATIC_CACHE_TIMEOUT
        response.expires = datetime.now() + timedelta(seconds=STATIC_CACHE_TIMEOUT)
    return response

app.after_request(add_cache_headers)

# Load dictionary on startup
WORD_DICT = load_dictionary()
logger.debug(f"Dictionary loaded with {len(WORD_DICT)} words")

@app.route('/')
def index():
    if 'user_id' not in session:
        session['user_id'] = secrets.token_urlsafe(8)
    
    return render_template('index.html')

LETTERS = np.array(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])
WEIGHTS = np.array([17, 3, 8, 9, 20, 6, 3, 12, 17, 1/3, 3, 12, 9, 15, 17, 2, 2, 13, 19, 19, 3, 2, 7, 1/3, 3, 1/3]) / 222

@app.route('/new-grid')
def new_grid():
    try:
        # Generate grid more efficiently using numpy's vectorized operations
        grid = np.random.choice(LETTERS, size=(4, 4), p=WEIGHTS).tolist()
        response = jsonify({'grid': grid})
        response.headers['Cache-Control'] = 'no-store'
        return response
    except Exception as e:
        logger.error(f"Error generating grid: {str(e)}")
        return jsonify({'error': 'Failed to generate grid'}), 500

@app.route('/validate/<word>')
def validate_word(word):
    try:
        word = word.upper()
        valid = is_valid_word(word, WORD_DICT)
        logger.debug(f"Validating word: {word} - Result: {'valid' if valid else 'invalid'}")
        response = jsonify({'valid': valid})
        response.headers['Cache-Control'] = 'private, no-store'
        return response
    except Exception as e:
        logger.error(f"Error validating word: {str(e)}")
        return jsonify({'error': 'Invalid request'}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)