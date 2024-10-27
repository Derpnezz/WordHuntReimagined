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
    # Generate a 4x4 grid of random letters
    # Use more common letters with higher probability
    #vowels = 'AEIOU'
    #common_consonants = 'RSTLNBCDFGHMPW'  # More common consonants first
    #rare_consonants = 'JKQVXYZ'  # Less common consonants

    every = 'STE'
    common = 'AINO'
    rare = 'RLH'
    rarer = 'CDM'
    rarest = 'FW'
    rarestest = 'BGKUY'
    rarestestest = 'PQV'
    almostnever = 'JXZ'

    LETTER_LIST = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    occurence = np.array([17, 3, 8, 9, 20, 6, 3, 12, 17, (1/3), 3, 12, 9, 15, 17, 2, 2, 13, 19, 19, 3, 2, 7, (1/3), 3, (1/3)])
    totalOccurence = 222
    weights = occurence / totalOccurence
    
    grid = []
    for _ in range(4):
        row = []
        for _ in range(4):
            letter = random.choices(LETTER_LIST, weights)
            #rand = random.random()
            #rand = random.uniform(0, 30.93093093)
            #if rand < 0.1501501502:  # % chances
                #letter = random.choice(almostnever)
            #elif rand < 1.051051051:  # 
                #letter = random.choice(rarestestest)
            #elif rand < 2.402402402:
                #letter = random.choice(rarestest)
            #elif rand < 5.33033033:
                #letter = random.choice(rarest)
            #lif rand < 9.234234234:
                #letter = random.choice(rarer)
           #elif rand < 14.78978979:
               # letter = random.choice(rare)
            #elif rand < 22.22222222:
                #letter = random.choice(common)
            #else:  # 10% chance of rare consonant
                #letter = random.choice(every)
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
        
        if user_id and score:
            save_high_score(user_id, score, 'solo')
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
