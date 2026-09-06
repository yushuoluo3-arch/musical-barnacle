// Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

// Player paddle
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

// Computer paddle
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 4,
    dy: 4,
    size: ballSize,
    speed: 4
};

// Score
let playerScore = 0;
let computerScore = 0;
let gameRunning = false;
let gameStarted = false;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        gameStarted = true;
        document.getElementById('startBtn').textContent = 'Game Running...';
        document.getElementById('startBtn').disabled = true;
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    gameRunning = false;
    gameStarted = false;
    resetBall();
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    document.getElementById('startBtn').textContent = 'Start Game';
    document.getElementById('startBtn').disabled = false;
});

// Draw functions
function drawRect(x, y, width, height, color = '#00ff88') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color = '#00ff88') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height);
    drawRect(computer.x, computer.y, computer.width, computer.height);

    // Draw ball
    drawCircle(ball.x, ball.y, ball.size);

    // Draw court borders
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Update functions
function updatePlayer() {
    // Arrow keys or mouse control
    if (keys['ArrowUp'] || keys['w']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y += player.speed;
    }

    // Mouse control
    if (mouseY > 0 && mouseY < canvas.height) {
        const paddleCenter = player.y + player.height / 2;
        const distance = mouseY - paddleCenter;
        
        if (Math.abs(distance) > 5) {
            player.y += Math.sign(distance) * player.speed;
        }
    }

    // Boundary collision
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const distance = ballCenter - computerCenter;

    // AI follows ball with some delay for difficulty
    if (Math.abs(distance) > 10) {
        computer.y += Math.sign(distance) * computer.speed;
    }

    // Boundary collision
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

function updateBall() {
    if (!gameRunning) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 2;
    }

    // Computer paddle collision
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 2;
    }

    // Score points
    if (ball.x - ball.size < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }
    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }

    // Limit ball speed
    const maxSpeed = 7;
    if (Math.abs(ball.dx) > maxSpeed) ball.dx = Math.sign(ball.dx) * maxSpeed;
    if (Math.abs(ball.dy) > maxSpeed) ball.dy = Math.sign(ball.dy) * maxSpeed;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.dy = (Math.random() - 0.5) * 4;
    gameRunning = false;
    
    // Auto-restart after 1 second
    setTimeout(() => {
        if (gameStarted) {
            gameRunning = true;
        }
    }, 1000);
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();