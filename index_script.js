let pressStart = new Date().getTime();
let pauseStart = new Date().getTime();

let dahLenght = 250;
let ditLenght = dahLenght / 3;

let dahFactor = 3;
let spaceFactor = 1;
let letterFactor = 3;
let wordFactor = 7;

let timesPressed = 0;
let randomWords = false;
let randomWordsArray = [];
let resetFlag = false;

let language = 'en';
let length = 5;
let amount = 1;

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
    "a": ".-",
    "b": "-...",
    "c": "-.-.",
    "d": "-..",
    "e": ".",
    "f": "..-.",
    "g": "--.",
    "h": "....",
    "i": "..",
    "j": ".---",
    "k": "-.-",
    "l": ".-..",
    "m": "--",
    "n": "-.",
    "o": "---",
    "p": ".--.",
    "q": "--.-",
    "r": ".-.",
    "s": "...",
    "t": "-",
    "u": "..-",
    "v": "...-",
    "w": ".--",
    "x": "-..-",
    "y": "-.--",
    "z": "--..",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "!": "-.-.--",
    "-": "-....-",
    "/": "-..-.",
    "@": ".--.-.",
    "(": "-.--.",
    ")": "-.--.-",
    "-----": "0",
    ".----": "1",
    "..---": "2",
    "...--": "3",
    "....-": "4",
    ".....": "5",
    "-....": "6",
    "--...": "7",
    "---..": "8",
    "----.": "9",
    ".-": "a",
    "-...": "b",
    "-.-.": "c",
    "-..": "d",
    ".": "e",
    "..-.": "f",
    "--.": "g",
    "....": "h",
    "..": "i",
    ".---": "j",
    "-.-": "k",
    ".-..": "l",
    "--": "m",
    "-.": "n",
    "---": "o",
    ".--.": "p",
    "--.-": "q",
    ".-.": "r",
    "...": "s",
    "-": "t",
    "..-": "u",
    "...-": "v",
    ".--": "w",
    "-..-": "x",
    "-.--": "y",
    "--..": "z",
    ".-.-.-": ".",
    "--..--": ",",
    "..--..": "?",
    "-.-.--": "!",
    "-....-": "-",
    "-..-.": "/",
    ".--.-.": "@",
    "-.--.": "(",
    "-.--.-": ")"
}

addEventListener('DOMContentLoaded', async function () {
    changeSpeed();
    changeLength();
    changeLanguage();
    if (this.document.getElementById('random-word-switch').checked) {
        randomWordSwitch();
    }
});

addEventListener('keydown', async function (event) {
    if (event.key === 'Enter' || event.key == ' ') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        startMorseCode();
    }
});

addEventListener('keyup', async function (event) {
    if (event.key === 'Enter' || event.key == ' ') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        evalMorseCode();
    }
});

async function startMorseCode() {
    pressStart = new Date().getTime();
    timesPressed++;
    if (randomWords && resetFlag) {
        this.document.getElementById('display-morse').innerHTML = '';
        updateAlphanumeric();
        resetFlag = false;
    }
}

async function evalMorseCode() {
    let display = this.document.getElementById('display-morse');
    let currentTime = new Date().getTime();
    let elapsedTime = currentTime - pressStart;

    let morseCode = '';

    if (elapsedTime < ditLenght * dahFactor) {
        morseCode = '.';
    } else {
        morseCode = '-';
    }

    let timesPressedSaved = timesPressed;

    setTimeout(async () => {
        if (timesPressedSaved == timesPressed) {
            display.innerHTML += ' ';
            display.scrollLeft = display.scrollWidth;
        }
    }, ditLenght * letterFactor);
    setTimeout(async () => {
        if (timesPressedSaved == timesPressed) {
            display.innerHTML += ' / ';
            display.scrollLeft = display.scrollWidth;

            console.log(toAlphanumeric(display.innerHTML).trim());

            if (randomWords) {
                resetFlag = true;
                if (toAlphanumeric(display.innerHTML).trim() == randomWordsArray[0].toUpperCase()) {
                    randomWordsArray.shift();
                    if (randomWordsArray.length < 3) {
                        getNewRandomWords(5).then(data => {
                            randomWordsArray.concat(data);
                        });
                    }
                    let display = this.document.getElementById('display-random-word');
                    display.innerHTML = randomWordsArray[0].toUpperCase();
                    resetFlag = true;
                }
            }
        }
    }, ditLenght * wordFactor);

    display.innerHTML += morseCode;
    display.scrollLeft = display.scrollWidth;

    this.document.getElementById('tone-length').innerHTML = elapsedTime;

    updateAlphanumeric();
}

function toMorseCode(alphanumeric) {
    let morseCode = '';

    for (let i = 0; i < alphanumeric.length; i++) {
        let char = alphanumeric.charAt(i).toLowerCase();
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

function changeLength() {
    length = this.document.getElementById('length').value;
}

function changeLanguage() {
    language = this.document.getElementById('language').value;
}