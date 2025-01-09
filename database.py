import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import DictCursor
from contextlib import contextmanager

# Create a connection pool with retries
retries = 3
db_pool = None

for attempt in range(retries):
    try:
        db_pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            host=os.environ.get('PGHOST'),
            database=os.environ.get('PGDATABASE'),
            user=os.environ.get('PGUSER'),
            password=os.environ.get('PGPASSWORD'),
            port=os.environ.get('PGPORT'),
            connect_timeout=5
        )
        if db_pool:
            break
    except Exception as e:
        print(f"Database connection attempt {attempt + 1} failed: {e}")
        if attempt == retries - 1:
            print("All connection attempts failed")

@contextmanager
def get_db_connection():
    """Get a database connection from the pool"""
    if db_pool is None:
        yield None
        return
        
    conn = None
    try:
        conn = db_pool.getconn()
        # Test if connection is alive
        conn.cursor().execute('SELECT 1')
        yield conn
    except Exception as e:
        print(f"Database connection error: {e}")
        yield None
    finally:
        if conn:
            db_pool.putconn(conn)

def init_db():
    """Initialize the database schema"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Create high scores table if it doesn't exist
            cur.execute('''
                CREATE TABLE IF NOT EXISTS high_scores (
                    id SERIAL PRIMARY KEY,
                    player_id VARCHAR(255) NOT NULL,
                    player_name VARCHAR(20) NOT NULL,
                    score INTEGER NOT NULL,
                    game_mode VARCHAR(10) NOT NULL DEFAULT 'multi',
                    game_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create index on score for faster retrieval
            cur.execute('''
                CREATE INDEX IF NOT EXISTS idx_score ON high_scores(score DESC)
            ''')
            
            conn.commit()

def save_high_score(player_id, player_name, score, game_mode='multi'):
    """Save a new high score"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO high_scores (player_id, player_name, score, game_mode) VALUES (%s, %s, %s, %s)',
                (player_id, player_name, score, game_mode)
            )
            conn.commit()

def get_top_scores(limit=100, game_mode='multi'):
    """Get top scores for a given game mode"""
    if db_pool is None:
        return None
        
    try:
        with get_db_connection() as conn:
            if conn is None:  # Return None if connection fails
                return None
            with conn.cursor(cursor_factory=DictCursor) as cur:
                cur.execute('''
                    SELECT player_name, score, game_date 
                    FROM high_scores 
                    WHERE game_mode = %s
                    ORDER BY score DESC 
                    LIMIT %s
                ''', (game_mode, limit))
                return [dict(row) for row in cur.fetchall()]
    except Exception:
        return None