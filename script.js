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

//bemeneti mezők létrehozása
function createInputs() {
    const greenContainer = document.querySelector('.greenPos');
    const yellowContainer = document.querySelector('.yellowPos');
    const grayContainer = document.querySelector('.grayPos');

    //zöld betűk jó helyen vannak
    for (let i = 0; i < 5; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.placeholder = i + 1;
        input.className = 'greenInput';
        input.addEventListener('input', filterWords);
        greenContainer.appendChild(input);
    }

    //sárga betűk rossz helyen vannak
    for (let i = 0; i < 5; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 5; 
        input.placeholder = `Not ${i+1}`;
        input.className = 'yellowInput';
        input.addEventListener('input', filterWords);
        yellowContainer.appendChild(input);
    }

    //szürke betűk nincsenek a szóban
    const grayInput = document.createElement('input');
    grayInput.type = 'text';
    grayInput.placeholder = 'e.g. RSTLNE';
    grayInput.className = 'grayInput';
    grayInput.addEventListener('input', filterWords);
    grayContainer.appendChild(grayInput);
}

//szavak szűrése input alapján, majd megjelenítése
function filterWords() {
    const greenInputs = Array.from(document.querySelectorAll('.greenInput')).map(i => i.value.toLowerCase());
    const yellowInputs = Array.from(document.querySelectorAll('.yellowInput')).map(i => i.value.toLowerCase());
    const grayInput = document.querySelector('.grayInput').value.toLowerCase();

    const filtered = allWords.filter(word => {
        //szürke betűk kizárása
        for (let char of grayInput) {
            if (word.includes(char)) return false;
        }

        //zöld betűk helyes pozícióban vannak
        for (let i = 0; i < 5; i++) {
            if (greenInputs[i] && word[i] !== greenInputs[i]) return false;
        }

        //sárga betűk szerepelnek a szóban, de nem a megadott pozícióban
        for (let i = 0; i < 5; i++) {
            const letters = yellowInputs[i];
            if (letters) {
                for (let char of letters) {
                    //sárga betűk szerepelnek a szóban
                    if (!word.includes(char)) return false;
                }
                //de nem a megadott pozícióban
                if (letters.includes(word[i])) return false;
            }
        }

        return true;
    });

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
        const more = document.createElement('li');
        more.textContent = `+ ${words.length - 150} more`;
        more.className = "more-count";
        possibleWordsElement.appendChild(more);
    }
}

createInputs();
loadWords();
