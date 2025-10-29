// --- DATA PATH GAMBAR KACAMATA (8 IKON UNIK + 1 BELAKANG KARTU) ---
// PENTING: File-file ini harus ada di folder 'assets/' di repositori GitHub Anda.
const CARD_ICONS = [
    'assets/1.png', // Diubah ke .png
    'assets/2.png', // Diubah ke .png
    'assets/3.png', // Diubah ke .png
    'assets/4.png', // Diubah ke .png
    'assets/5.png', // Diubah ke .png
    'assets/6.png', // Diubah ke .png
    'assets/7.png', // Diubah ke .png
    'assets/8.png'  // Diubah ke .png
];

// Gambar Belakang Kartu (Logo Bilions Network - Ikon B)
const CARD_BACK_IMAGE = 'assets/9.png'; // Diubah ke 9.png

const GAME_SIZE = 16; 

// --- ELEMEN DOM ---
const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('startButton');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const leaderboardList = document.getElementById('leaderboard-list');
const winModal = document.getElementById('win-modal');
const finalTime = document.getElementById('final-time');
const finalMoves = document.getElementById('final-moves');
const closeModalButton = document.getElementById('closeModal');

// --- VARIABEL STATE GAME ---
let cardsArray = [];
let cardsFlipped = []; 
let matchesFound = 0;
let moves = 0;
let gameStarted = false;
let timerInterval;
let startTime;

// --- FUNGSI UTAMA GAME ---

// 1. Algoritma Fisher-Yates Shuffle
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

// 2. Mempersiapkan Data Kartu (Menggandakan dan Mengacak)
function initializeCards() {
    let gameCards = [...CARD_ICONS, ...CARD_ICONS];
    cardsArray = shuffle(gameCards);
}

// 3. Membuat Elemen Kartu di DOM
function createBoard() {
    gameBoard.innerHTML = ''; 
    cardsArray.forEach((imagePath, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = index; 
        card.dataset.image = imagePath; // Kunci pasangan

        // Bagian Depan Kartu (Ikon Kacamata)
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        const img = document.createElement('img');
        img.src = imagePath;
        cardFront.appendChild(img);

        // Bagian Belakang Kartu (Logo Bilions)
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

// 4. Logika Timer
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

// 5. Penanganan Klik Kartu
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

// 6. Memeriksa Kecocokan Kartu
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

// 7. Mengakhiri Game dan Menampilkan Modal
function endGame() {
    stopTimer();
    gameStarted = false;

    const finalTimeValue = timerDisplay.textContent;

    finalTime.textContent = finalTimeValue;
    finalMoves.textContent = moves;
    winModal.style.display = 'flex';
    
    saveScore(finalTimeValue, moves);
    renderLeaderboard();
    
    startButton.disabled = false;
    startButton.textContent = 'Mulai Game Baru';
}

// 8. Logika Memulai Game
function startGame() {
    stopTimer();
    gameStarted = true;
    moves = 0;
    matchesFound = 0;
    movesDisplay.textContent = 0;
    timerDisplay.textContent = '00:00';
    
    startButton.disabled = true;
    startButton.textContent = 'Game Berjalan...'; 

    initializeCards();
    createBoard();
    startTimer();
}


// --- FUNGSI LEADERBOARD LOKAL ---

const LEADERBOARD_KEY = 'bilionShadesLeaderboard';

function getScores() {
    try {
        const scores = localStorage.getItem(LEADERBOARD_KEY);
        return scores ? JSON.parse(scores) : [];
    } catch (e) {
        console.error("Gagal mengambil skor dari localStorage:", e);
        return [];
    }
}

function saveScore(timeStr, moves) {
    if (moves === 0) return; 

    const scores = getScores();
    const [minutes, seconds] = timeStr.split(':').map(Number);
    const totalSeconds = (minutes * 60) + seconds;

    scores.push({ time: timeStr, totalSeconds, moves, date: new Date().toLocaleDateString('id-ID') });

    scores.sort((a, b) => {
        if (a.totalSeconds !== b.totalSeconds) {
            return a.totalSeconds - b.totalSeconds;
        }
        return a.moves - b.moves;
    });

    const topScores = scores.slice(0, 5);
    try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topScores));
    } catch (e) {
        console.error("Gagal menyimpan skor ke localStorage:", e);
    }
}

function renderLeaderboard() {
    const scores = getScores();
    leaderboardList.innerHTML = '';
    
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<li style="justify-content: center; color: #8b949e;">Belum ada skor. Mainkan sekarang!</li>';
        return;
    }

    scores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>#${index + 1}. ${score.time} (${score.moves} Gerakan)</span>
            <small style="color: #8b949e;">${score.date}</small>
        `;
        leaderboardList.appendChild(listItem);
    });
}


// --- TITIK AWAL APLIKASI ---

document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard(); 

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

