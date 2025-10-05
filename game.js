class DinoRunGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.jumpBtn = document.getElementById('jumpBtn');
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.highScore = localStorage.getItem('dinoRunHighScore') || 0;
        this.gameSpeed = 2;
        this.gravity = 0.6;
        this.jumpPower = -15;
        
        // Dino properties
        this.dino = {
            x: 50,
            y: this.canvas.height - 100,
            width: 40,
            height: 50,
            velocityY: 0,
            isJumping: false,
            groundY: this.canvas.height - 100
        };
        
        // Obstacles array
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 120; // frames between obstacles
        
        // Ground
        this.groundY = this.canvas.height - 50;
        
        this.init();
    }
    
    init() {
        this.highScoreElement.textContent = this.highScore;
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
        
        // Mouse/touch controls
        this.jumpBtn.addEventListener('click', () => this.jump());
        this.restartBtn.addEventListener('click', () => this.restart());
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
        
        this.canvas.addEventListener('click', (e) => {
            this.jump();
        });
    }
    
    jump() {
        if (!this.gameRunning) {
            this.startGame();
            return;
        }
        
        if (!this.dino.isJumping) {
            this.dino.velocityY = this.jumpPower;
            this.dino.isJumping = true;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.dino.y = this.dino.groundY;
        this.dino.velocityY = 0;
        this.dino.isJumping = false;
        this.gameOverElement.style.display = 'none';
        this.updateScore();
    }
    
    restart() {
        this.startGame();
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update dino physics
        this.updateDino();
        
        // Update obstacles
        this.updateObstacles();
        
        // Check collisions
        this.checkCollisions();
        
        // Update score
        this.score += 1;
        this.updateScore();
        
        // Increase game speed gradually
        if (this.score % 1000 === 0) {
            this.gameSpeed += 0.2;
        }
    }
    
    updateDino() {
        // Apply gravity
        this.dino.velocityY += this.gravity;
        this.dino.y += this.dino.velocityY;
        
        // Ground collision
        if (this.dino.y >= this.dino.groundY) {
            this.dino.y = this.dino.groundY;
            this.dino.velocityY = 0;
            this.dino.isJumping = false;
        }
    }
    
    updateObstacles() {
        // Create new obstacles
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.createObstacle();
            this.obstacleTimer = 0;
        }
        
        // Move obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.x -= this.gameSpeed;
            
            // Remove obstacles that are off screen
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(index, 1);
            }
        });
    }
    
    createObstacle() {
        const obstacle = {
            x: this.canvas.width,
            y: this.groundY - 40,
            width: 20,
            height: 40,
            type: 'cactus'
        };
        this.obstacles.push(obstacle);
    }
    
    checkCollisions() {
        this.obstacles.forEach(obstacle => {
            if (this.dino.x < obstacle.x + obstacle.width &&
                this.dino.x + this.dino.width > obstacle.x &&
                this.dino.y < obstacle.y + obstacle.height &&
                this.dino.y + this.dino.height > obstacle.y) {
                this.gameOver();
            }
        });
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('dinoRunHighScore', this.highScore);
        }
        
        this.gameOverElement.style.display = 'block';
    }
    
    updateScore() {
        this.scoreElement.textContent = Math.floor(this.score / 10);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Draw ground line
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();
        
        // Draw dino
        this.drawDino();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw clouds
        this.drawClouds();
    }
    
    drawDino() {
        const dino = this.dino;
        
        // Dino body
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        
        // Dino head
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(dino.x + 25, dino.y - 15, 20, 20);
        
        // Dino eye
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(dino.x + 35, dino.y - 10, 3, 3);
        
        // Dino legs (simple animation)
        this.ctx.fillStyle = '#228B22';
        const legOffset = Math.sin(Date.now() * 0.01) * 2;
        this.ctx.fillRect(dino.x + 10, dino.y + dino.height, 5, 10);
        this.ctx.fillRect(dino.x + 25, dino.y + dino.height + legOffset, 5, 10);
        
        // Dino tail
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(dino.x - 10, dino.y + 10, 15, 8);
    }
    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            // Cactus body
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Cactus arms
            this.ctx.fillRect(obstacle.x - 5, obstacle.y + 10, 8, 15);
            this.ctx.fillRect(obstacle.x + obstacle.width - 3, obstacle.y + 5, 8, 12);
            
            // Cactus spikes
            this.ctx.strokeStyle = '#006400';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < obstacle.height; i += 8) {
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y + i);
                this.ctx.lineTo(obstacle.x + obstacle.width / 2 + 3, obstacle.y + i + 3);
                this.ctx.stroke();
            }
        });
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Simple cloud shapes
        const time = Date.now() * 0.0005;
        for (let i = 0; i < 3; i++) {
            const x = (i * 300 + time * 20) % (this.canvas.width + 100) - 50;
            const y = 50 + i * 30;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DinoRunGame();
});

// Farcaster Frame API endpoint (for when deployed)
if (typeof window !== 'undefined' && window.location.pathname === '/api/frame') {
    // This would be handled by your server
    console.log('Farcaster frame API endpoint');
}
