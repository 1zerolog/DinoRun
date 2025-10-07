// Super Simple DinoRun - Guaranteed to Work!
let canvas, ctx;
let dino = { x: 50, y: 200, width: 30, height: 30, velocityY: 0, onGround: true };
let obstacles = [];
let score = 0;
let gameRunning = false;
let gravity = 0.8;
let jumpPower = -12;

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 300;
    
    // Set dino position
    dino.y = canvas.height - dino.height - 20;
    
    // Start game loop
    gameLoop();
    
    // Start game after 1 second
    setTimeout(() => {
        gameRunning = true;
        document.getElementById('gameStartMessage').style.display = 'none';
    }, 1000);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    if (!gameRunning) return;
    
    // Update dino
    dino.velocityY += gravity;
    dino.y += dino.velocityY;
    
    // Ground collision
    if (dino.y >= canvas.height - dino.height - 20) {
        dino.y = canvas.height - dino.height - 20;
        dino.velocityY = 0;
        dino.onGround = true;
    }
    
    // Create obstacles
    if (Math.random() < 0.02) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 40 - 20,
            width: 20,
            height: 40
        });
    }
    
    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 3;
        
        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score += 10;
            document.getElementById('score').textContent = score;
        }
        
        // Check collision
        if (dino.x < obstacles[i].x + obstacles[i].width &&
            dino.x + dino.width > obstacles[i].x &&
            dino.y < obstacles[i].y + obstacles[i].height &&
            dino.y + dino.height > obstacles[i].y) {
            
            gameOver();
        }
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Draw dino
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    
    // Draw dino eye
    ctx.fillStyle = '#000';
    ctx.fillRect(dino.x + 20, dino.y + 5, 5, 5);
    
    // Draw obstacles
    ctx.fillStyle = '#8B4513';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

// Jump function
function jump() {
    if (!gameRunning) return;
    if (!dino.onGround) return;
    
    dino.velocityY = jumpPower;
    dino.onGround = false;
}

// Game over
function gameOver() {
    gameRunning = false;
    alert('Game Over! Score: ' + score + '\nClick OK to restart!');
    restart();
}

// Restart game
function restart() {
    dino = { x: 50, y: canvas.height - 30 - 20, width: 30, height: 30, velocityY: 0, onGround: true };
    obstacles = [];
    score = 0;
    document.getElementById('score').textContent = score;
    
    setTimeout(() => {
        gameRunning = true;
    }, 500);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', jump);

// Start when page loads
window.addEventListener('load', init);
