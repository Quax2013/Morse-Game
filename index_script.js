let pressStart = new Date().getTime();
let pauseStart = new Date().getTime();

let dahLenght = 250;
let ditLenght = dahLenght / 3;

let dahFactor = 3;
let spaceFactor = 1;
let letterFactor = 3;
let wordFactor = 7;

let timesPressed = 0;
let lastSign = '';

let randomWords = false;
let randomWordsArray = [];
let resetFlag = false;

let ditHold = false;
let dahHold = false;

let iambicB = false;

let language = 'en';
let length = 5;
let amount = 1;

let context;
let oscillator;
let gain;

let volume = 1;

let waitForFirstInput = true;

let morse = {
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    "A": ".-",
    "B": "-...",
    "C": "-.-.",
    "D": "-..",
    "E": ".",
    "F": "..-.",
    "G": "--.",
    "H": "....",
    "I": "..",
    "J": ".---",
    "K": "-.-",
    "L": ".-..",
    "M": "--",
    "N": "-.",
    "O": "---",
    "P": ".--.",
    "Q": "--.-",
    "R": ".-.",
    "S": "...",
    "T": "-",
    "U": "..-",
    "V": "...-",
    "W": ".--",
    "X": "-..-",
    "Y": "-.--",
    "Z": "--..",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "!": "-.-.--",
    "-": "-....-",
    "/": "-..-.",
    "@": ".--.-.",
    "(": "-.--.",
    ")": "-.--.-"
}

const delay = ms => new Promise(res => setTimeout(res, ms));

addEventListener('DOMContentLoaded', async function () {
    changeSpeed();
    changeLength();
    changeLanguage();
    changeVolume();
    if (this.document.getElementById('random-word-switch').checked) {
        randomWordSwitch();
    }

    this.document.getElementById('straight-key').addEventListener('taphold', async function (event) {
        event.preventDefault();
    });

    populateCharacterList();

    for (key in morse) {
        morse[morse[key]] = key;
    }
});

addEventListener('keydown', async function (event) {
    if (waitForFirstInput) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        oscillator = context.createOscillator();
        gain = context.createGain();

        gain.gain.value = 0;
        oscillator.frequency.value = 750;
        oscillator.connect(gain);

        oscillator.start(0);
        gain.connect(context.destination);
    }

    if (event.key === 'Enter' || event.key == ' ') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        startMorseCode();

        this.document.getElementById('straight-key').classList.add('active');
    }

    if (event.key === '.') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        startAutomaticDit();
    }

    if (event.key === '-') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        startAutomaticDah();
    }
});

addEventListener('keyup', async function (event) {
    if (event.key === 'Enter' || event.key == ' ') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        evalMorseCode();

        this.document.getElementById('straight-key').classList.remove('active');
    }

    if (event.key === '.') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        stopAutomaticDit();
    }

    if (event.key === '-') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        stopAutomaticDah();
    }
});

async function startMorseCode() {
    if (!waitForFirstInput) {
        gain.gain.value = 0;
    }

    pressStart = new Date().getTime();
    timesPressed++;
    if (randomWords && resetFlag) {
        this.document.getElementById('display-morse').innerHTML = '';
        updateAlphanumeric();
        resetFlag = false;
    }

    gain.gain.value = volume;
}

async function evalMorseCode(bypass = false) {
    let currentTime = new Date().getTime();
    let elapsedTime = currentTime - pressStart;

    let morseCode = '';

    gain.gain.value = 0;

    if (elapsedTime < ditLenght * dahFactor) {
        morseCode = '.';
    } else {
        morseCode = '-';
    }

    if (!bypass) addMorseCode(morseCode);

    this.document.getElementById('tone-length').innerHTML = elapsedTime;

    checkPauseLenght();
}

async function checkPauseLenght() {
    let display = this.document.getElementById('display-morse');
    let timesPressedSaved = timesPressed;

    setTimeout(async () => {
        if (timesPressedSaved == timesPressed) {
            addMorseCode(" ");
        }
    }, ditLenght * letterFactor);
    setTimeout(async () => {
        if (timesPressedSaved == timesPressed) {
            addMorseCode(" / ");

            if (randomWords) {
                resetFlag = true;
                if (toAlphanumeric(display.innerHTML).trim() == randomWordsArray[0].toUpperCase()) {
                    nextRandomWord();
                }

                if (randomWordsArray.length < 3) {
                    refillRandomWords();
                }
            }
        }
    }, ditLenght * wordFactor);
}

function addMorseCode(sign) {
    let display = this.document.getElementById('display-morse');
    display.innerHTML += sign;
    display.scrollLeft = display.scrollWidth;

    updateAlphanumeric();

    lastSign = sign;
}

function toMorseCode(alphanumeric) {
    let morseCode = '';

    for (let i = 0; i < alphanumeric.length; i++) {
        let char = alphanumeric.charAt(i);
        if (morse[char] != undefined) {
            morseCode += morse[char] + '&#65533;';
        } else if (char == ' ') {
            morseCode += '/ ';
        } else {
            morseCode += char + ' ';
        }
    }

    return morseCode;
}

function toAlphanumeric(morseCode) {
    let morseCodeArray = morseCode.split(' ');
    let alphanumeric = '';

    morseCodeArray.forEach(element => {
        if (element == '/') {
            alphanumeric += ' ';
        } else if (morse[element] != undefined && element != '') {
            alphanumeric += morse[element].toUpperCase();
        } else if (morse[element] == undefined && element != '') {
            alphanumeric += "&#65533;";
        }
    });

    return alphanumeric;
}


async function changeSpeed() {
    let speed = this.document.getElementById('speed').value;
    dahLenght = speed;
    ditLenght = dahLenght / 3;
}

async function updateAlphanumeric() {
    let display = this.document.getElementById('display-alphanumeric');
    let morseCode = this.document.getElementById('display-morse').innerHTML;

    let alphanumeric = toAlphanumeric(morseCode);

    display.innerHTML = alphanumeric;
    display.scrollLeft = display.scrollWidth;
}

async function randomWordSwitch() {
    randomWords = !randomWords;

    if (randomWords) {
        getNewRandomWords(5).then(data => {
            randomWordsArray = data
            let display = this.document.getElementById('display-random-word');
            display.innerHTML = data[0].toUpperCase();
        });
    } else {
        this.document.getElementById('display-random-word').innerHTML = '';
    }
}

async function getNewRandomWords(amount, lenght, language) {
    if (amount == undefined) {
        amount = 1;
    }
    if (lenght == undefined || lenght == "") {
        lenght = "";
    } else {
        lenght = "&length=" + lenght;
    }
    if (language == undefined || language == "" || language == "en") {
        language = "";
    } else {
        language = "&lang=" + language;
    }

    let url = 'https://random-word-api.vercel.app/api?words=' + amount + lenght + language;
    let response = await fetch(url);
    let data = await response.json();

    return data;
}

async function refillRandomWords() {
    let newWords = await getNewRandomWords(5);
    console.log(newWords);
    for (let i = 0; i < newWords.length; i++) {
        randomWordsArray.push(newWords[i]);
    }
    console.log(randomWordsArray);
}
function nextRandomWord() {
    randomWordsArray.shift();
    let display = this.document.getElementById('display-random-word');
    display.innerHTML = randomWordsArray[0].toUpperCase();
    resetFlag = true;
}

function populateCharacterList() {
    let list = this.document.getElementById('character-list');
    for (key in morse) {
        let listItem = this.document.createElement('div');
        listItem.innerHTML = key + ' = ' + morse[key];
        list.appendChild(listItem);
    }
}

async function changeVolume() {
    volume = this.document.getElementById('volume').value / 100;
}

async function changeLength() {
    length = this.document.getElementById('length').value;
}

async function changeLanguage() {
    language = this.document.getElementById('language').value;
}

async function changeKey() {
    let selction = this.document.getElementById('key').value;
}

async function startAutomaticDit() {
    let saveTimesPressed = timesPressed;
    ditHold = true;

    if (randomWords && resetFlag) {
        this.document.getElementById('display-morse').innerHTML = '';
        updateAlphanumeric();
        resetFlag = false;
    }

    while (ditHold && saveTimesPressed == timesPressed) {
        timesPressed++;
        saveTimesPressed++;
        addMorseCode('.');
        gain.gain.value = volume;
        await delay(ditLenght);
        gain.gain.value = 0;
        await delay(ditLenght);
    }
    if (saveTimesPressed == timesPressed) checkPauseLenght();
}

async function stopAutomaticDit() {
    console.log('stop');
    ditHold = false;
}

async function startAutomaticDah() {
    let saveTimesPressed = timesPressed;
    dahHold = true;

    if (randomWords && resetFlag) {
        this.document.getElementById('display-morse').innerHTML = '';
        updateAlphanumeric();
        resetFlag = false;
    }

    while (dahHold && saveTimesPressed == timesPressed) {
        timesPressed++;
        saveTimesPressed++;
        addMorseCode('-');
        gain.gain.value = volume;
        await delay(ditLenght * dahFactor);
        gain.gain.value = 0;
        await delay(ditLenght);
    }
    if (saveTimesPressed == timesPressed) checkPauseLenght();
}

async function stopAutomaticDah() {
    console.log('stop');
    dahHold = false;
}