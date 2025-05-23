import urllib.request
import re

def download_enable_wordlist():
    url = "https://www.wordgamedictionary.com/enable/download/enable.txt"
    try:
        response = urllib.request.urlopen(url)
        words = response.read().decode('utf-8').split('\n')
        return words
    except:
        # Fallback to a smaller set of common words if download fails
        print("Failed to download word list, using fallback list")
        return []

def process_words():
    words = download_enable_wordlist()
    valid_words = set()
    
    # Define a pattern for valid words (only letters, no special chars)
    # Updated pattern to include words up to 9 letters
    pattern = re.compile(r'^[A-Za-z]{3,9}$')
    
    for word in words:
        word = word.strip().upper()
        if pattern.match(word):
            # Add words that are 3-9 letters long
            if 3 <= len(word) <= 9:
                valid_words.add(word)
    
    # Sort words alphabetically
    sorted_words = sorted(list(valid_words))
    
    # Write to file
    with open('static/words.txt', 'w') as f:
        f.write('\n'.join(sorted_words))
    
    print(f"Processed {len(sorted_words)} valid words")

if __name__ == "__main__":
    process_words()
