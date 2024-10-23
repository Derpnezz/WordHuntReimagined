from flask import Flask, render_template, jsonify
import random
import string
from game_utils import load_dictionary, is_valid_word
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = "word_hunt_secret_key"

# Load dictionary on startup
WORD_DICT = load_dictionary()
logger.info(f"Dictionary loaded with {len(WORD_DICT)} words")

@app.route('/')
def index():
    return render_template('index.html')

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
    
    # Log the grid for debugging
    print("Generated Grid:", grid)
    return jsonify({'grid': grid})

@app.route('/validate/<word>')
def validate_word(word):
    word = word.upper()
    valid = is_valid_word(word, WORD_DICT)
    logger.info(f"Validating word: {word} - Result: {'valid' if valid else 'invalid'}")
    return jsonify({'valid': valid})
