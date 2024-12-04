_dictionary_cache = None

def load_dictionary():
    """Load and cache the dictionary of valid words"""
    global _dictionary_cache
    if _dictionary_cache is None:
        _dictionary_cache = set()
        with open('static/words.txt', 'r') as f:
            for line in f:
                word = line.strip().upper()
                if 3 <= len(word) <= 9:  # Only include words between 3-9 letters
                    _dictionary_cache.add(word)
    return _dictionary_cache

def is_valid_word(word, dictionary=None):
    """Check if a word is valid using the cached dictionary"""
    if dictionary is None:
        dictionary = load_dictionary()
    return word in dictionary