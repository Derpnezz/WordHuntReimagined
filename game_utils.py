def load_dictionary():
    words = set()
    with open('static/words.txt', 'r') as f:
        for line in f:
            word = line.strip().upper()
            if len(word) >= 3:  # Only include words of 3 or more letters
                words.add(word)
    return words

def is_valid_word(word, dictionary):
    return word in dictionary and len(word) >= 3
