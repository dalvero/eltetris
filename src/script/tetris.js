let canvas; // VARIABEL UNTUK MENYIMPAN CANVAS
let ctx; // VARIABEL UNTUK MENYIMPAN CONTEXT DARI CANVAS, BIASANYA DIGUNAKAN UNTUK MENGGAMBAR PADA CANVAS 2D RENDERING CONTEXT
let gBArrayHeight = 20; // VARIABEL UNTUK MENYIMPAN TINGGI DARI GRID TETRIS
let gBArrayWidth = 12; // VARIABEL UNTUK MENYIMPAN PANJANG DARI TETRIS

let controlCanvas; // VARIABEL MENYIMPAN CANVAS CONTROL
let ctxControl;

// MENGAMBIL CANVAS GAME
canvas = document.getElementById("my-canvas");
canvas.width = gBArrayWidth * 30;
canvas.height = gBArrayHeight * 30;

// MENGAMBIL CONTEXT
ctx = canvas.getContext("2d");

// MENGAMBIL CANVAS CONTROL
controlCanvas = document.getElementById("container");
controlCanvas.width = gBArrayWidth * 30;
controlCanvas.height = gBArrayHeight * 30;

// MENGAMBIL CONTEXT
ctxControl = controlCanvas.getContext("2d");

let startX = 4; // VARIABEL UNTUK MENYIMPAN POSISI PERTAMA KALI TETROMINO, YAITU 4 DARI KIRI
let startY = 0; // VARIABEL UNTUK MENYIMPAN POSISI PERTAMA KALI TETROMINO, YAITU 0 DARI ATAS

// VARIABEL UNTUK MENYIMPAN ARRAY DIDALAM CANVAS
let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(null));

let score = 0;
let level = 0;
let linesCleared = 0;
let dropSpeed = 500; // KECEPATAN TURUN/GRAVITASI
let isPaused = false;
let isRestart = false;

// BACKSOUND
const bgMusic = new Audio("bg/mainBg.wav");
const clearLineSound = new Audio("bg/deleteLineBg.wav");
const rotateSound = new Audio("bg/rotationBg.wav");
const gameOverSound = new Audio("bg/gameOverBg.wav");
const touchFloorSound = new Audio("bg/touchFloorBg.wav");

// LOOPING BACKSOUND
bgMusic.loop = true;
bgMusic.volume = 0.5; // VOLUME

// OBJEK TETROMINOS
const tetrominoes = {
    I: [[1, 1, 1, 1]],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ]
};

// OBJEK WARNA TETROMINOS
const tetrominoColors = {
    I: "cyan",
    J: "blue",
    L: "orange",
    O: "yellow",
    S: "green",
    Z: "red",
    T: "purple"
};

// VARIABEL MENYIMPAN WARNA TERBARU TETROMINOS
let currentTetroColors;

// FUNCTION UNTUK MENGUNCI TETROMINOS KETIKA ADA DI GARIS PALING BAWAH
function lockTetromino() {
    for (let row = 0; row < currentTetro.length; row++) {
        for (let col = 0; col < currentTetro[row].length; col++) {
            if (currentTetro[row][col] === 1) {
                let newX = startX + col;
                let newY = startY + row;
                coordinateArray[newY][newX] = currentTetroColors; // MENYIMPAN TETROMINOS TERBARU KEDALAM GAME CANVAS
            }
        }
    }
    clearFullRows();
}

// FUNCTION UNTUK MEMBUAT TETROMINOS BARU
function spawnNewTetromino() {
    currentTetro = nextTetrominoType.shape;
    currentTetroColors = nextTetrominoType.color;

    // MEMILIH TETROMINOS TERBARU DENGAN RANDOM/ACAK
    nextTetrominoType = getRandomTetromino();

    // POSISI AWAL TETROMINOS
    startX = 4; // DARI KIRI
    startY = 0; // DARI ATAS

    // MENDETEKSI APAKAH TETROMINOS PENUH ? JIKA IYA MAKA AKAN GAME OVER
    if (collision(startX, startY, currentTetro)) {
        gameOverSound.play();
        score = 0;
        coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(null));
    }
}

// FUNCTION UNTUK MENGHAPUS SELURUH BARIS
function clearFullRows() {
    let rowsCleared = 0;

    for (let row = gBArrayHeight - 1; row >= 0; row--) {
        if (coordinateArray[row].every(cell => cell !== null)) {
            // MENGHAPUS BARIS DENGAN MENGGESER BARIS YANG SUDAH PENUH KEBAWAH
            for (let y = row; y > 0; y--) {
                coordinateArray[y] = [...coordinateArray[y - 1]];
            }
            // MEMBUAT BARIS KOSONG DI PALING ATAS
            coordinateArray[0] = new Array(gBArrayWidth).fill(null);
            
            // KARENA ADA BARIS YANG DIHAPUS KITA CEK LAGI DARI BARIS YANG SAMA
            rowsCleared++;
            row++;
            clearLineSound.currentTime = 0;
            clearLineSound.play();
        }
    }

    // MENAMBAHKAN SKOR BERDASARKAN JUMLAH BARIS YANG DIHAPUS
    if (rowsCleared === 1) score += 100;
    else if (rowsCleared === 2) score += 300;
    else if (rowsCleared === 3) score += 500;
    else if (rowsCleared === 4) score += 800;

    linesCleared += rowsCleared;

    // MENINGKATKAN LEVEL SETIAP 10 BARIS YANG DIHAPUS
    if (linesCleared >= level * 10) {
        level++;
        dropSpeed *= 0.9; // MEMPERCEPAT KECEPATAN / MEMPERBESAR GRAVITASI
    }

    console.log(score);
    drawScore(); // MEMPERBARUI TAMPILAN SCROE
    drawLevel();
}

let currentTetro = tetrominoes.T;
let nextTetrominoType = getRandomTetromino(); // MENDAPATKAN TETROMINO BERIKUTNYAT

// FUNCTION UNTUK MENDAPATKAN TETROMINO RANDOM/ACAKA
function getRandomTetromino() {
    const tetrominoKeys = Object.keys(tetrominoes);
    let randomKey = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
    return {
        shape: tetrominoes[randomKey],
        color: tetrominoColors[randomKey]
    };
}

// FUNCTION UNTUK MENGGAMBAR TETROMINO
function drawTetromino(matrix, x, y) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] === 1) {
                if (currentTetroColors === undefined) {
                    currentTetroColors = "blue";
                }
                ctx.fillStyle = currentTetroColors;
                ctx.fillRect((x + col) * 30, (y + row) * 30, 30, 30);
                ctx.strokeStyle = "black";
                ctx.strokeRect((x + col) * 30, (y + row) * 30, 30, 30);
            }
        }
    }
}

// FUNCTION MENGGAMBAR TETROMINO BERIKUTNYA DI PANEL KONTROL
function drawNextTetromino() {
    ctxControl.clearRect(0, 0, controlCanvas.width, controlCanvas.height);

    let nextX = 20;
    let nextY = 40;

    ctxControl.fillStyle = "white";
    ctxControl.fillRect(nextX - 10, nextY - 40, 300, 350);
    ctxControl.strokeStyle = "black"
    ctxControl.strokeRect(nextX, nextY-10, 80, 70);

    let shape = nextTetrominoType.shape;
    let color = nextTetrominoType.color;

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                ctxControl.fillStyle = color;
                ctxControl.fillRect(nextX + col * 20, nextY + row * 20, 20, 20);
                ctxControl.strokeStyle = "black";
                ctxControl.strokeRect(nextX + col * 20, nextY + row * 20, 20, 20);
            }
        }
    }

    ctxControl.fillStyle = "black";
    ctxControl.font = "18px Arial";
    ctxControl.fillText("Next", nextX, nextY - 15);
}

// FUNCTION UNTUK MEMBUAT TEXT SCORE
function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score  : " + score, 10, 30);
}

// FUNCTION UNTUK MEMBUAT TEXT LEVEL
function drawLevel() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Level  : " + level, 10, 60);
}


// FUNCTION UNTUK MENGGAMBAR KETERANGAN CONTROL
function drawControls(){
    ctxControl.font = "50px Arial"
    ctxControl.fillStyle = "black";
    ctxControl.fillText("Control", 20, 145);

    ctxControl.font = "20px Arial";
    ctxControl.fillStyle = "black";
    ctxControl.fillText("←  : Move Left", 20, 180);
    ctxControl.fillText("→  : Move Right", 20, 210);
    ctxControl.fillText("↓    : Move Down", 20, 240);
    ctxControl.fillText("↑    : Rotate", 20, 270);
    ctxControl.fillText("P   : Pause", 20, 300);
    ctxControl.fillText("R   : Restart", 20, 330);
}

// FUNCTION UNTUK MEMULAI GAME
function drawGame() {
    // MENGUBAH WARNA BACKGROUND CANVAS
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black"
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctxControl.fillStyle = "white";
    ctxControl.fillRect(0, 0, canvas.width, canvas.height);
    ctxControl.strokeStyle = "black"
    ctxControl.strokeRect(0, 0, canvas.width, canvas.height);

    // MENGGAMBAR TETROMINO YANG SUDAH ADA DIBAWAH
    for (let row = 0; row < gBArrayHeight; row++) {
        for (let col = 0; col < gBArrayWidth; col++) {
            if (coordinateArray[row][col]) { // JIKA ADA WARNANYA
                ctx.fillStyle = coordinateArray[row][col]; // MENGGUNAKAN WARNA TERSEBUT
                ctx.fillRect(col * 30, row * 30, 30, 30);
                ctx.strokeStyle = "black";
                ctx.strokeRect(col * 30, row * 30, 30, 30);
            }
        }
    }
    
    drawTetromino(currentTetro, startX, startY);
    drawScore();
    drawLevel();
    drawNextTetromino();
    drawControls();
}

// FUNCTION COLLISION
function collision(x, y, piece) {
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col] === 1) { // MENGECEK BAGIAN YANG SUDAH ADA BLOKNYA
                let newX = x + col;
                let newY = y + row;

                // MENGECEK APAKAH KELUAR DARI BATAS KIRI, KANAN ATAU BAWAH
                if (newX < 0 || newX >= gBArrayWidth || newY >= gBArrayHeight) {
                    return true;
                }

                // Cek apakah ada tetromino lain di posisi tersebut
                if (coordinateArray[newY][newX] !== null) {
                    return true;
                }
            }
        }
    }
    return false;
}

// FUNCTION PAUSE
function togglePause() {
    isPaused = !isPaused;
}

function restartGame() {
    coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(null));
    gameOverSound.play();
    score = 0;
    level = 1;
    linesCleared = 0;
    dropSpeed = 500;

    bgMusic.pause();
    bgMusic.currentTime = 0;
    bgMusic.play();

    // Spawn tetromino baru
    spawnNewTetromino();

    drawGame();
    
}

// FUNCTION UNTUK MENGGAMBAR PAUSE
function drawPauseScreen() {
    if (isPaused === true)  {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Paused", (canvas.width / 2 - 50) - 50, canvas.height / 2);
    }
}

// FUNCTION UPDATE/GAME START
function update() {
    if(isPaused === true){
        drawGame();
        drawScore();
        drawLevel();
        drawPauseScreen();
        dropSpeed = 0;
        bgMusic.pause();
    } else {
        bgMusic.play();
        if (!collision(startX, startY + 1, currentTetro)) {
            startY++; // TETROMINO AKAN TURUN JIKA TIDAK BERTABRAKAN
        } else {
            lockTetromino(); // MENGUNCI TETROMINO KETIKA MENYENTUH DASAR
            touchFloorSound.currentTime = 0;
            touchFloorSound.play();
            spawnNewTetromino(); // MEMBUAT TETROMINO BARU
        }
        drawGame();
        drawScore();
        drawLevel();
    }
}

// GAME LOOPING
setInterval(update, dropSpeed);
drawControls();

// GAME CONTROL
document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft" && !collision(startX - 1, startY, currentTetro)) {
        startX--;
    } else if (event.key === "ArrowRight" && !collision(startX + 1, startY, currentTetro)) {
        startX++;
    } else if (event.key === "ArrowDown" && !collision(startX, startY + 1, currentTetro)) {
        startY++;
    } else if (event.key === "ArrowUp") {
        let rotated = rotatePiece();
        if (rotated && !collision(startX, startY, rotated)) {
            rotateSound.currentTime = 0;
            rotateSound.play();
            currentTetro = rotated; // TETROMINO AKAN BEROTASI JIKA ROTASI VALID
        }
        
    } else if (event.key === "p") {
        togglePause();
        drawPauseScreen();
    } else if (event.key === "r") {
        bgMusic.currentTime = 0;
        gameOverSound.currentTime = 0;
        gameOverSound.play();
        score = 0;
        isRestart = true;
        restartGame();
    }

    drawGame();
});


function rotatePiece() {
    let rotated = currentTetro[0].map((_, index) =>
        currentTetro.map(row => row[index])
    ).reverse();

    return rotated; // MENGEMBALIKAN ARRAY BARU
}



