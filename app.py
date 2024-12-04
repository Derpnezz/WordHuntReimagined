from flask import Flask, render_template, jsonify, request, session
import random
import numpy as np
import secrets
from game_utils import load_dictionary, is_valid_word
import logging
from database import init_db, save_high_score, get_top_scores

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = "word_hunt_secret_key"

# Initialize database
init_db()

# Load dictionary on startup
WORD_DICT = load_dictionary()
logger.info(f"Dictionary loaded with {len(WORD_DICT)} words")

@app.route('/')
def index():
    if 'user_id' not in session:
        session['user_id'] = secrets.token_urlsafe(8)
    
    solo_scores = get_top_scores(game_mode='solo')
    return render_template('index.html', solo_scores=solo_scores)

@app.route('/new-grid')
def new_grid():
    LETTER_LIST = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    occurence = np.array([17, 3, 8, 9, 20, 6, 3, 12, 17, (1/3), 3, 12, 9, 15, 17, 2, 2, 13, 19, 19, 3, 2, 7, (1/3), 3, (1/3)])
    totalOccurence = 222
    weights = occurence / totalOccurence
    
    grid = []
    for _ in range(4):
        row = []
        for _ in range(4):
            letter = random.choices(LETTER_LIST, weights)
            row.append(letter[0])
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
        player_name = data.get('player_name', 'Anonymous')
        game_mode = data.get('mode', 'solo')
        
        if user_id and score:
            save_high_score(user_id, player_name, score, game_mode)
            return jsonify({'success': True})
        
        return jsonify({'success': False, 'error': 'Invalid data'}), 400
    except Exception as e:
        logger.error(f"Error saving score: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/leaderboard')
def leaderboard():
    solo_scores = get_top_scores(game_mode='solo')
    return jsonify({
        'solo_scores': solo_scores
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
@app.route('/ping')
def ping():
    return jsonify({'status': 'alive'})

