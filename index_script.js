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

let automaticRunning = false;
let ditHold = false;
let dahHold = false;
let ditHoldStop = new Date().getTime();
let dahHoldStop = new Date().getTime();

let selectedKey = 'straight';
let iambicB = false;
let iambicTolerance = 30;

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
    changeKey();
    changeIambic();
    changeIambicTolerance();
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

    if (selectedKey == 'straight' && (event.key === 'Enter' || event.key == ' ')) {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        startMorseCode();

        this.document.getElementById('straight-key').classList.add('active');
    }

    if (selectedKey == 'dual-lever' && event.key === '.') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        startAutomaticDit();

        this.document.getElementById('dual-lever-key-dit').classList.add('active');
    }

    if (selectedKey == 'dual-lever' && event.key === '-') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        startAutomaticDah();

        this.document.getElementById('dual-lever-key-dah').classList.add('active');
    }
});

addEventListener('keyup', async function (event) {
    if (selectedKey == 'straight' && (event.key === 'Enter' || event.key == ' ')) {
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

        this.document.getElementById('dual-lever-key-dit').classList.remove('active');
    }

    if (event.key === '-') {
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        stopAutomaticDah();

        this.document.getElementById('dual-lever-key-dah').classList.remove('active');
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

async function changeSpeed() {
    let speed = this.document.getElementById('speed').value;
    dahLenght = speed;
    ditLenght = dahLenght / 3;
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
    selectedKey = this.document.getElementById('key').value;
    let keyContainers = this.document.getElementById('key-containers');

    for (let i = 0; i < keyContainers.children.length; i++) {
        keyContainers.children[i].style.display = 'none';
    }

    if (selectedKey == 'straight') {
        this.document.getElementById('straight-key-container').style.display = 'block';
    } else if (selectedKey == 'dual-lever') {
        this.document.getElementById('dual-lever-key-container').style.display = 'block';
    }
}

async function changeIambic() {
    let type = this.document.getElementById('iambic').value;
    if (type == 'a') {
        iambicB = false;
        document.getElementById('iambic-tolerance').disabled = true;
    } else {
        iambicB = true;
        document.getElementById('iambic-tolerance').disabled = false;
    }
}

async function changeIambicTolerance() {
    iambicTolerance = this.document.getElementById('iambic-tolerance').value;
}

async function startAutomaticDit() {
    ditHold = true;
    if (!automaticRunning) {
        runAutomatic();
    }
}

async function stopAutomaticDit() {
    ditHold = false;
    ditHoldStop = new Date().getTime();
}

async function startAutomaticDah() {
    dahHold = true;
    if (!automaticRunning) {
        runAutomatic();
    }
}

async function stopAutomaticDah() {
    dahHold = false;
    dahHoldStop = new Date().getTime();
}

async function runAutomatic() {
    automaticRunning = true;

    if (randomWords && resetFlag) {
        this.document.getElementById('display-morse').innerHTML = '';
        updateAlphanumeric();
        resetFlag = false;
    }

    while (ditHold || dahHold) {
        if (ditHold && dahHold) {
            if (lastSign == '.') {
                await addMorseCodeLocal('-');
            } else if (lastSign == '-') {
                await addMorseCodeLocal('.');
            }
        } else if (ditHold) {
            await addMorseCodeLocal('.');
        } else if (dahHold) {
            await addMorseCodeLocal('-');
        }
    }
    automaticRunning = false;

    if (iambicB && Math.abs(ditHoldStop - dahHoldStop) < iambicTolerance) {
        console.log(Math.abs(ditHoldStop - dahHoldStop));
        if (lastSign == '.') {
            await addMorseCodeLocal('-');
        } else if (lastSign == '-') {
            await addMorseCodeLocal('.');
        }
    }

    checkPauseLenght();

    async function addMorseCodeLocal(sign) {
        addMorseCode(sign);
        timesPressed++;
        gain.gain.value = volume;
        if (sign == '.') {
            await delay(ditLenght);
        } else if (sign == '-') {
            await delay(ditLenght * dahFactor);
        }
        gain.gain.value = 0;
        await delay(ditLenght);
    }
}

// async function startAutomaticDit() {
//     let saveTimesPressed = timesPressed;
//     ditHold = true;

//     if (randomWords && resetFlag) {
//         this.document.getElementById('display-morse').innerHTML = '';
//         updateAlphanumeric();
//         resetFlag = false;
//     }

//     while (ditHold && saveTimesPressed == timesPressed) {
//         timesPressed++;
//         saveTimesPressed++;
//         addMorseCode('.');
//         gain.gain.value = volume;
//         await delay(ditLenght);
//         gain.gain.value = 0;
//         await delay(ditLenght);
//     }
//     gain.gain.value = 0;
//     if (saveTimesPressed == timesPressed) checkPauseLenght();
// }

// async function stopAutomaticDit() {
//     console.log('stop');
//     ditHold = false;
//     gain.gain.value = 0;
// }

// async function startAutomaticDah() {
//     let saveTimesPressed = timesPressed;
//     dahHold = true;

//     if (randomWords && resetFlag) {
//         this.document.getElementById('display-morse').innerHTML = '';
//         updateAlphanumeric();
//         resetFlag = false;
//     }

//     while (dahHold && saveTimesPressed == timesPressed) {
//         timesPressed++;
//         saveTimesPressed++;
//         addMorseCode('-');
//         gain.gain.value = volume;
//         await delay(ditLenght * dahFactor);
//         gain.gain.value = 0;
//         await delay(ditLenght);
//     }
//     gain.gain.value = 0;
//     if (saveTimesPressed == timesPressed) checkPauseLenght();
// }

// async function stopAutomaticDah() {
//     console.log('stop');
//     dahHold = false;
//     gain.gain.value = 0;
// }