import os
import psycopg2
from psycopg2.extras import DictCursor

def get_db_connection():
    return psycopg2.connect(
        host=os.environ['PGHOST'],
        database=os.environ['PGDATABASE'],
        user=os.environ['PGUSER'],
        password=os.environ['PGPASSWORD'],
        port=os.environ['PGPORT']
    )

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Drop existing table if it exists
    cur.execute('DROP TABLE IF EXISTS high_scores')
    
    # Create high scores table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS high_scores (
            id SERIAL PRIMARY KEY,
            player_id VARCHAR(255) NOT NULL,
            score INTEGER NOT NULL,
            game_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create index on score for faster retrieval
    cur.execute('CREATE INDEX IF NOT EXISTS idx_score ON high_scores(score DESC)')
    
    conn.commit()
    cur.close()
    conn.close()

def save_high_score(player_id, score):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        'INSERT INTO high_scores (player_id, score) VALUES (%s, %s)',
        (player_id, score)
    )
    
    conn.commit()
    cur.close()
    conn.close()

def get_top_scores(limit=10):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=DictCursor)
    
    cur.execute('''
        SELECT player_id, score, game_date 
        FROM high_scores 
        ORDER BY score DESC 
        LIMIT %s
    ''', (limit,))
    
    scores = [dict(row) for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    return scores
