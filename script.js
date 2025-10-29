// --- PENTING: ASSET CARD ---
// Daftar nama file ikon kartu yang Anda miliki (8 ikon unik)
// Asumsi: Anda menyimpan file-file ini di folder 'assets/'
const CARD_ICONS = [
    'assets/card-1.png',
    'assets/card-2.png',
    'assets/card-3.png',
    'assets/card-4.png',
    'assets/card-5.png',
    'assets/card-6.png',
    'assets/card-7.png',
    'assets/card-8.png'
];
const CARD_BACK_IMAGE = 'assets/card-back.png';
const GAME_SIZE = 16; // 4x4 grid

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
let cardsFlipped = []; // Kartu yang sedang terbalik
let matchesFound = 0;
let moves = 0;
let gameStarted = false;
let timerInterval;
let startTime;

// --- FUNGSI UTAMA GAME ---

// 1. Algoritma Fisher-Yates Shuffle (Full Effort Teknikal)
// Algoritma pengacakan yang efisien dan adil.
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Tukar elemen
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}

// 2. Mempersiapkan Data Kartu
function initializeCards() {
    // Gandakan 8 ikon menjadi 16 kartu (8 pasang)
    let gameCards = [...CARD_ICONS, ...CARD_ICONS];
    
    // Shuffle kartu
    cardsArray = shuffle(gameCards);
    
    // Atur ulang tampilan grid untuk 4x4
    gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
}

// 3. Membuat Elemen Kartu di DOM
function createBoard() {
    gameBoard.innerHTML = ''; // Bersihkan papan
    cardsArray.forEach((imagePath, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = index; // ID posisi
        card.dataset.image = imagePath; // ID pasangan

        // Bagian Depan Kartu (Ikon)
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
        
        // Tambahkan event listener untuk klik
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
    if (!gameStarted || cardsFlipped.length >= 2 || event.currentTarget.classList.contains('flip')) {
        return; // Abaikan jika game belum mulai, 2 kartu sudah terbalik, atau kartu sudah dibalik
    }

    const clickedCard = event.currentTarget;
    clickedCard.classList.add('flip');
    cardsFlipped.push(clickedCard);

    if (cardsFlipped.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        setTimeout(checkForMatch, 1000); // Beri waktu 1 detik untuk melihat kartu
    }
}

// 6. Memeriksa Kecocokan Kartu
function checkForMatch() {
    const [card1, card2] = cardsFlipped;
    
    if (card1.dataset.image === card2.dataset.image) {
        // Kartu Cocok!
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.removeEventListener('click', handleCardClick);
        card2.removeEventListener('click', handleCardClick);
        matchesFound++;
        
        // Cek apakah game selesai
        if (matchesFound === CARD_ICONS.length) {
            endGame();
        }
    } else {
        // Kartu Tidak Cocok, kembalikan posisi
        card1.classList.remove('flip');
        card2.classList.remove('flip');
    }

    cardsFlipped = []; // Reset kartu terbalik
}

// 7. Mengakhiri Game dan Menampilkan Modal
function endGame() {
    stopTimer();
    gameStarted = false;

    const finalTimeValue = timerDisplay.textContent;

    // Tampilkan hasil di Modal
    finalTime.textContent = finalTimeValue;
    finalMoves.textContent = moves;
    winModal.style.display = 'flex';
    
    // Simpan skor
    saveScore(finalTimeValue, moves);
    renderLeaderboard();
}

// 8. Logika Memulai Game
function startGame() {
    stopTimer();
    gameStarted = true;
    moves = 0;
    matchesFound = 0;
    movesDisplay.textContent = 0;
    timerDisplay.textContent = '00:00';
    
    // Nonaktifkan tombol saat game berjalan
    startButton.disabled = true;
    startButton.textContent = 'Game Berjalan...'; 

    initializeCards();
    createBoard();
    startTimer();
}


// --- FUNGSI LEADERBOARD (UNSUR KOMUNITAS) ---

const LEADERBOARD_KEY = 'bilionShadesLeaderboard';

// Mengambil skor dari localStorage
function getScores() {
    const scores = localStorage.getItem(LEADERBOARD_KEY);
    return scores ? JSON.parse(scores) : [];
}

// Menyimpan skor baru dan mengurutkannya (Menggunakan Waktu dan Gerakan)
function saveScore(timeStr, moves) {
    const scores = getScores();
    const [minutes, seconds] = timeStr.split(':').map(Number);
    const totalSeconds = (minutes * 60) + seconds;

    // Tambahkan skor baru
    scores.push({ time: timeStr, totalSeconds, moves, date: new Date().toLocaleDateString() });

    // Urutkan: Waktu lebih cepat (totalSeconds lebih kecil), kemudian gerakan lebih sedikit
    scores.sort((a, b) => {
        if (a.totalSeconds !== b.totalSeconds) {
            return a.totalSeconds - b.totalSeconds;
        }
        return a.moves - b.moves;
    });

    // Pertahankan hanya 5 skor terbaik
    const topScores = scores.slice(0, 5);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topScores));
}

// Menampilkan Leaderboard ke DOM
function renderLeaderboard() {
    const scores = getScores();
    leaderboardList.innerHTML = '';
    
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<li>Belum ada skor. Mainkan sekarang!</li>';
        return;
    }

    scores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>#${index + 1}. ${score.time} (${score.moves} Gerakan)</span>
            <small>${score.date}</small>
        `;
        leaderboardList.appendChild(listItem);
    });
}


// --- INI ADALAH TITIK AWAL APLIKASI ---

document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard(); // Tampilkan Leaderboard saat pertama kali dibuka

    startButton.addEventListener('click', () => {
        // Atur ulang tombol dan mulai game
        startButton.textContent = 'Mulai Game Baru';
        startButton.disabled = false;
        startGame();
    });

    closeModalButton.addEventListener('click', () => {
        winModal.style.display = 'none';
    });

    // Menangani penutupan modal dengan mengklik di luar konten
    winModal.addEventListener('click', (e) => {
        if (e.target === winModal) {
            winModal.style.display = 'none';
        }
    });

    // Tampilkan game board awal (kosong/belum diacak)
    initializeCards();
    createBoard();
    
    // Pastikan tombol aktif
    startButton.disabled = false;
});
