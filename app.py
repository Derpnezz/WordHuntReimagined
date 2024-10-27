from flask import Flask, render_template, jsonify, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
import string
from game_utils import load_dictionary, is_valid_word
import logging
import secrets
from database import init_db, save_high_score, get_top_scores
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = "word_hunt_secret_key"
socketio = SocketIO(app)

# Initialize database
init_db()

# Load dictionary on startup
WORD_DICT = load_dictionary()
logger.info(f"Dictionary loaded with {len(WORD_DICT)} words")

# Game rooms storage
game_rooms = {}

@app.route('/')
def index():
    if 'user_id' not in session:
        session['user_id'] = secrets.token_urlsafe(8)
    
    solo_scores = get_top_scores(game_mode='solo')
    multi_scores = get_top_scores(game_mode='multi')
    return render_template('index.html', solo_scores=solo_scores, multi_scores=multi_scores)

@app.route('/new-grid')
def new_grid():
    # Generate a 4x4 grid of random letters
    # Use more common letters with higher probability
    vowels = 'AEIOU'
    common_consonants = 'RSTLNBCDFGHMPW'  # More common consonants first
    rare_consonants = 'JKQVXYZ'  # Less common consonants
    
    grid = []
    for _ in range(4):
        row = []
        for _ in range(4):
            rand = random.random()
            if rand < 0.35:  # 35% chance of vowel
                letter = random.choice(vowels)
            elif rand < 0.85:  # 50% chance of common consonant
                letter = random.choice(common_consonants)
            else:  # 15% chance of rare consonant
                letter = random.choice(rare_consonants)
            row.append(letter)
        grid.append(row)
    
    return jsonify({'grid': grid})

@app.route('/validate/<word>')
def validate_word(word):
    word = word.upper()
    valid = is_valid_word(word, WORD_DICT)
    logger.info(f"Validating word: {word} - Result: {'valid' if valid else 'invalid'}")
    return jsonify({'valid': valid})

@app.route('/save-score', methods=['POST'])
def save_score():
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        score = data.get('score')
        mode = data.get('mode', 'multi')  # Default to multi if not specified
        
        if user_id and score:
            save_high_score(user_id, score, mode)
            return jsonify({'success': True})
        
        return jsonify({'success': False, 'error': 'Invalid data'}), 400
    except Exception as e:
        logger.error(f"Error saving score: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/leaderboard')
def leaderboard():
    solo_scores = get_top_scores(game_mode='solo')
    multi_scores = get_top_scores(game_mode='multi')
    return jsonify({
        'solo_scores': solo_scores,
        'multi_scores': multi_scores
    })

# Socket.IO event handlers
# ... [Previous socket.io handlers remain unchanged]

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
