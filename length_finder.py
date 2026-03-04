WORD_SIZE = 5
ALL_WORDS_FILE = "words_alpha.txt"
WORDLE_WORDS_FILE = "words_five.txt"

all_words = open(ALL_WORDS_FILE).read().splitlines()
correct_length_words = [word for word in all_words if len(word) == WORD_SIZE]

with open(WORDLE_WORDS_FILE, "w") as f:
    for word in correct_length_words:
        f.write(word + "\n")
