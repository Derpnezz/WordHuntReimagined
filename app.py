from flask import Flask, render_template, jsonify, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
import string
from game_utils import load_dictionary, is_valid_word
import logging
import secrets
import os
import psycopg2
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = "word_hunt_secret_key"
socketio = SocketIO(app)

# Database connection
def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

# Initialize database
def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS high_scores (
            id SERIAL PRIMARY KEY,
            player_id VARCHAR(255) NOT NULL,
            score INTEGER NOT NULL,
            word_count INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    cur.close()
    conn.close()

# Initialize database on startup
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
    
    return jsonify({'grid': grid})

@app.route('/validate/<word>')
def validate_word(word):
    word = word.upper()
    valid = is_valid_word(word, WORD_DICT)
    logger.info(f"Validating word: {word} - Result: {'valid' if valid else 'invalid'}")
    return jsonify({'valid': valid})

@app.route('/high-scores')
def get_high_scores():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT player_id, score, word_count, timestamp 
        FROM high_scores 
        ORDER BY score DESC 
        LIMIT 10
    ''')
    scores = [{'player_id': row[0], 'score': row[1], 
               'word_count': row[2], 'timestamp': row[3].strftime('%Y-%m-%d %H:%M:%S')} 
              for row in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify(scores)

def save_high_score(player_id, score, word_count):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO high_scores (player_id, score, word_count)
        VALUES (%s, %s, %s)
    ''', (player_id, score, word_count))
    conn.commit()
    cur.close()
    conn.close()
    logger.info(f"Saved high score for player {player_id}: {score} points, {word_count} words")

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    user_id = session.get('user_id')
    emit('connected', {'user_id': user_id})

@socketio.on('create_room')
def handle_create_room():
    room_id = secrets.token_urlsafe(6)
    user_id = session.get('user_id')
    
    game_rooms[room_id] = {
        'players': [user_id],
        'scores': {user_id: 0},
        'word_counts': {user_id: 0},
        'status': 'waiting',
        'host': user_id
    }
    
    join_room(room_id)
    emit('room_created', {
        'room_id': room_id,
        'players': game_rooms[room_id]['players']
    })

@socketio.on('join_room')
def handle_join_room(data):
    room_id = data['room_id']
    user_id = session.get('user_id')
    
    if room_id in game_rooms and len(game_rooms[room_id]['players']) < 2:
        game_rooms[room_id]['players'].append(user_id)
        game_rooms[room_id]['scores'][user_id] = 0
        game_rooms[room_id]['word_counts'][user_id] = 0
        join_room(room_id)
        
        emit('player_joined', {
            'players': game_rooms[room_id]['players']
        }, room=room_id)
        
        if len(game_rooms[room_id]['players']) == 2:
            emit('game_ready', room=room_id)
    else:
        emit('join_error', {'message': 'Room is full or does not exist'})

@socketio.on('start_game')
def handle_start_game(data):
    room_id = data['room_id']
    user_id = session.get('user_id')
    
    if room_id in game_rooms and game_rooms[room_id]['host'] == user_id:
        game_rooms[room_id]['status'] = 'playing'
        response = new_grid()
        grid_data = response.get_json()
        emit('game_started', {'grid': grid_data['grid']}, room=room_id)

@socketio.on('word_found')
def handle_word_found(data):
    room_id = data['room_id']
    word = data['word']
    user_id = session.get('user_id')
    
    logger.info(f"Word found event - Room: {room_id}, Player: {user_id}, Word: {word}")
    
    if room_id in game_rooms and user_id in game_rooms[room_id]['players']:
        valid = is_valid_word(word, WORD_DICT)
        if valid:
            points = {3: 100, 4: 400, 5: 800, 6: 1400}.get(len(word), 0)
            game_rooms[room_id]['scores'][user_id] += points
            game_rooms[room_id]['word_counts'][user_id] += 1
            
            logger.info(f"Score update - Player: {user_id}, Points: +{points}, "
                       f"Total Score: {game_rooms[room_id]['scores'][user_id]}")
            
            emit('score_update', {
                'user_id': user_id,
                'scores': game_rooms[room_id]['scores'],
                'word_counts': game_rooms[room_id]['word_counts'],
                'word': word,
                'points': points
            }, room=room_id)

@socketio.on('game_over')
def handle_game_over(data):
    room_id = data['room_id']
    if room_id in game_rooms:
        scores = game_rooms[room_id]['scores']
        word_counts = game_rooms[room_id]['word_counts']
        winner = max(scores.items(), key=lambda x: x[1])
        
        # Save high scores for all players
        for player_id, score in scores.items():
            save_high_score(player_id, score, word_counts[player_id])
        
        emit('game_ended', {
            'winner': winner[0],
            'final_scores': scores,
            'word_counts': word_counts
        }, room=room_id)
        
        # Get updated leaderboard
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT player_id, score, word_count, timestamp 
            FROM high_scores 
            ORDER BY score DESC 
            LIMIT 10
        ''')
        high_scores = [{'player_id': row[0], 'score': row[1], 
                       'word_count': row[2], 'timestamp': row[3].strftime('%Y-%m-%d %H:%M:%S')} 
                      for row in cur.fetchall()]
        cur.close()
        conn.close()
        
        emit('leaderboard_update', {'high_scores': high_scores}, room=room_id)
        del game_rooms[room_id]

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
