from flask import Flask, render_template, jsonify
import random
import string
from game_utils import load_dictionary, is_valid_word

app = Flask(__name__)
app.secret_key = "word_hunt_secret_key"

# Load dictionary on startup
WORD_DICT = load_dictionary()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new-grid')
def new_grid():
    # Generate a 4x4 grid of random letters
    # Use more common letters with higher probability
    vowels = 'AEIOU'
    consonants = 'BCDFGHJKLMNPQRSTVWXYZ'
    grid = []
    
    for _ in range(4):
        row = []
        for _ in range(4):
            if random.random() < 0.35:  # 35% chance of vowel
                row.append(random.choice(vowels))
            else:
                row.append(random.choice(consonants))
        grid.append(row)
    
    return jsonify({'grid': grid})

@app.route('/validate/<word>')
def validate_word(word):
    word = word.upper()
    valid = is_valid_word(word, WORD_DICT)
    return jsonify({'valid': valid})
