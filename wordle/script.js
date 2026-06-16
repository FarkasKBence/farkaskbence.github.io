const gridElement = document.getElementById('wordle-grid');
const possibleWordsElement = document.getElementById('possibleWords');
let allWords = [];

//szavak beolvasása txt-ből, majd első megjelenítése
async function loadWords() {
    try {
        const response = await fetch('words_five.txt');
        const text = await response.text();
        allWords = text.split("\n").map(word => word.trim()).filter(word => word.length === 5);
        updateResults(allWords);
    } catch (error) {
        console.error("Error loading word list:", error);
        possibleWordsElement.innerHTML = "<li>Error loading words_five.txt</li>";
    }
}

//bemeneti mezők létrehozása (5 sor 6 oszlop)
function createGrid() {
    const clearButton = document.getElementById('clearButton');
    
    for (let i = 0; i < 30; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.className = 'tile';
        input.dataset.state = "0"; //0: üres/fekete, 1: szürke, 2: zöld, 3: sárga

        //színváltás kattintásra
        //ha üres, marad fekete, különben váltogat a színek között
        input.addEventListener('click', function() {
            if (this.value === "") {
                this.dataset.state = "0";
            } else {
                let currentState = parseInt(this.dataset.state);
                this.dataset.state = currentState === 3 ? 1 : currentState + 1;
            }
            filterWords();
        });

        //visszalépés kezelése Backspace-szel
        //előző inputra lép és törli azt, ha az aktuális mező üres
        input.addEventListener('keydown', function(e) {
            if (e.key === "Backspace") {
                if (this.value === "") {
                    const prev = this.previousElementSibling;
                    if (prev && prev.classList.contains('tile')) {
                        prev.focus();
                        prev.value = "";
                        prev.dataset.state = "0";
                        filterWords();
                    }
                } else {
                    this.dataset.state = "0";
                    setTimeout(filterWords, 10);
                }
            }
        });

        //kitöltés és előrelépés kezelése
        //kitöltött mező esetén vált a szín és lép a következő mezőre
        input.addEventListener('input', function(e) {
            if (this.value) {
                this.value = this.value.toLowerCase();
                
                if (this.dataset.state === "0") {
                    this.dataset.state = "1";
                }
                
                const next = this.nextElementSibling;
                if (next && next.classList.contains('tile')) {
                    next.focus();
                }
            } else {
                this.dataset.state = "0";
            }
            filterWords();
        });

        gridElement.appendChild(input);
    }

    clearButton.addEventListener('click', () => {
        document.querySelectorAll('.tile').forEach(t => {
            t.value = '';
            t.dataset.state = "0";
        });
        updateResults(allWords);
    });

}

//szavak szűrése input alapján, majd megjelenítése
function filterWords() {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    let filtered = [...allWords];

    //soronkénti szűrés
    for (let row = 0; row < 6; row++) {
        const rowTiles = tiles.slice(row * 5, (row * 5) + 5);
        const guess = rowTiles.map(t => ({
            char: t.value.toLowerCase(),
            state: parseInt(t.dataset.state)
        })).filter(g => g.char !== "");

        if (guess.length === 0) continue;

        //megvizsgáljuk mennyi minimum és pontosan hány darab kell egy adott betűből
        const minCounts = {}; //sárgák alapján minimum követelmény
        const exactCounts = {}; //szürkék alapján pontos követelmény

        guess.forEach(item => {
            if (item.state > 1) { //zöld vagy sárga (2,3)
                minCounts[item.char] = (minCounts[item.char] || 0) + 1;
            }
        });

        guess.forEach(item => {
            if (item.state === 1) { //szürke jelzi pontosan hány darab kell egy adott betűből
                if (minCounts[item.char]) {
                    exactCounts[item.char] = minCounts[item.char];
                } else {
                    //ha csak szürke van, pontosan 0 darab kell
                    exactCounts[item.char] = 0;
                }
            }
        });

        //szűrés a fenti kritériumok alapján
        filtered = filtered.filter(word => {
            for (let i = 0; i < 5; i++) {
                const tile = rowTiles[i];
                const char = tile.value.toLowerCase();
                const state = parseInt(tile.dataset.state);
                
                if (state === 2 && word[i] !== char) return false; //zöldnek pontosan ebben a pozícióban kell lennie
                if (state === 3 && word[i] === char) return false; //sárga nem lehet ebben a pozícióban
                if (state === 1 && word[i] === char) return false; //szürke nem lehet ebben a pozícióban
            }

            const wordChars = word.split('');
            
            //minimum követelmények ellenőrzése
            for (let char in minCounts) {
                const countInWord = wordChars.filter(c => c === char).length;
                if (countInWord < minCounts[char]) return false;
            }

            //pontos követelmények ellenőrzése
            for (let char in exactCounts) {
                const countInWord = wordChars.filter(c => c === char).length;
                if (countInWord !== exactCounts[char]) return false;
            }

            return true;
        });
    }
    updateResults(filtered);
}

//UI frissítése
function updateResults(words) {
    possibleWordsElement.innerHTML = '';

    const displayList = words.slice(0, 150);
    displayList.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        possibleWordsElement.appendChild(li);
    });

    if (words.length > 150) {
        const more = document.createElement('strong');
        more.textContent = `+ ${words.length - 150} more`;
        more.className = "moreCount";
        possibleWordsElement.appendChild(more);
    }
}

createGrid();
loadWords();
