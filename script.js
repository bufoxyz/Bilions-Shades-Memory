// --- IMAGE PATH DATA (8 UNIQUE ICONS + 1 CARD BACK) ---
const CARD_ICONS = [
    'assets/1.png',
    'assets/2.png',
    'assets/3.png',
    'assets/4.png',
    'assets/5.png',
    'assets/6.png',
    'assets/7.png',
    'assets/8.png'
];

// Card Back Image
const CARD_BACK_IMAGE = 'assets/9.png';

const GAME_SIZE = 16; 

// --- DOM ELEMENTS ---
const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('startButton');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const winModal = document.getElementById('win-modal');
const finalTime = document.getElementById('final-time');
const finalMoves = document.getElementById('final-moves');
const closeModalButton = document.getElementById('closeModal');

// --- GAME STATE VARIABLES ---
let cardsArray = [];
let cardsFlipped = []; 
let matchesFound = 0;
let moves = 0;
let gameStarted = false;
let timerInterval;
let startTime;

// --- MAIN GAME FUNCTIONS ---

// 1. Fisher-Yates Shuffle Algorithm
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}

// 2. Prepare Card Data (Duplicate and Shuffle)
function initializeCards() {
    let gameCards = [...CARD_ICONS, ...CARD_ICONS];
    cardsArray = shuffle(gameCards);
}

// 3. Create Card Elements in DOM
function createBoard() {
    gameBoard.innerHTML = ''; 
    cardsArray.forEach((imagePath, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = index; 
        card.dataset.image = imagePath; 

        // Card Front (Bilions Icon)
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        const img = document.createElement('img');
        img.src = imagePath;
        cardFront.appendChild(img);

        // Card Back (Bilions Logo)
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        const backImg = document.createElement('img');
        backImg.src = CARD_BACK_IMAGE;
        cardBack.appendChild(backImg);

        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        card.addEventListener('click', handleCardClick);
        gameBoard.appendChild(card);
    });
}

// 4. Timer Logic
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsed / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// 5. Card Click Handler
function handleCardClick(event) {
    if (!gameStarted || cardsFlipped.length >= 2 || event.currentTarget.classList.contains('flip') || event.currentTarget.classList.contains('matched')) {
        return; 
    }

    const clickedCard = event.currentTarget;
    clickedCard.classList.add('flip');
    cardsFlipped.push(clickedCard);

    if (cardsFlipped.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        gameBoard.style.pointerEvents = 'none'; 
        setTimeout(checkForMatch, 1000); 
    }
}

// 6. Check for Card Match
function checkForMatch() {
    const [card1, card2] = cardsFlipped;
    
    if (card1.dataset.image === card2.dataset.image) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.removeEventListener('click', handleCardClick);
        card2.removeEventListener('click', handleCardClick);
        matchesFound++;
        
        if (matchesFound === CARD_ICONS.length) {
            endGame();
        }
    } else {
        card1.classList.remove('flip');
        card2.classList.remove('flip');
    }

    cardsFlipped = []; 
    gameBoard.style.pointerEvents = 'auto'; 
}

// 7. End Game and Display Modal
function endGame() {
    stopTimer();
    gameStarted = false;

    const finalTimeValue = timerDisplay.textContent;

    finalTime.textContent = finalTimeValue;
    finalMoves.textContent = moves;
    winModal.style.display = 'flex';
    
    startButton.disabled = false;
    startButton.textContent = 'Start New Game';
}

// 8. Game Start Logic
function startGame() {
    stopTimer();
    gameStarted = true;
    moves = 0;
    matchesFound = 0;
    movesDisplay.textContent = 0;
    timerDisplay.textContent = '00:00';
    
    startButton.disabled = true;
    startButton.textContent = 'Game in Progress...'; 

    initializeCards();
    createBoard();
    startTimer();
}


// --- APPLICATION ENTRY POINT ---

document.addEventListener('DOMContentLoaded', () => {

    startButton.addEventListener('click', () => {
        startGame();
    });

    closeModalButton.addEventListener('click', () => {
        winModal.style.display = 'none';
    });

    winModal.addEventListener('click', (e) => {
        if (e.target === winModal) {
            winModal.style.display = 'none';
        }
    });

    initializeCards();
    createBoard();
    
    startButton.disabled = false;
});
