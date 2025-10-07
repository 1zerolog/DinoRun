// 🦕 DinoRun Pro - Pixel Art Style with Moving Background & Multiple Obstacles
class DinoRunGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('dinoHighScore')) || 0;
        this.gameSpeed = 3;
        
        // Dino properties
        this.dino = {
            x: 50,
            y: 0,
            width: 32,
            height: 32,
            velocityY: 0,
            onGround: false,
            animationFrame: 0
        };
        
        // Obstacles array
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 90; // frames between obstacles
        
        // Ground level
        this.groundY = 0;
        
        // Physics
        this.gravity = 0.8;
        this.jumpPower = -14;
        
        // Background animation
        this.backgroundOffset = 0;
        this.clouds = [];
        this.generateClouds();
        
        // Touch controls
        this.touchStartY = 0;
        this.isTouchDevice = 'ontouchstart' in window;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateHighScore();
        this.gameLoop();
        
        // Auto start game after 2 seconds
        setTimeout(() => {
            this.startGame();
        }, 2000);
    }
    
    setupCanvas() {
        // Responsive canvas sizing
        const maxWidth = Math.min(600, window.innerWidth - 40);
        const aspectRatio = 600 / 300;
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxWidth / aspectRatio;
        
        this.groundY = this.canvas.height - 40;
        this.dino.y = this.groundY - this.dino.height;
        this.dino.onGround = true;
    }
    
    generateClouds() {
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width * 2,
                y: Math.random() * 100 + 20,
                size: Math.random() * 20 + 15,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
        
        // Mouse controls
        this.canvas.addEventListener('click', (e) => {
            this.jump();
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.jump();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.generateClouds();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.gameSpeed = 3;
        
        // Hide start message
        const startMsg = document.getElementById('gameStartMessage');
        if (startMsg) startMsg.style.display = 'none';
        
        console.log('🎮 Game Started!');
    }
    
    jump() {
        if (!this.gameRunning) return;
        if (!this.dino.onGround) return;
        
        this.dino.velocityY = this.jumpPower;
        this.dino.onGround = false;
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.updateDino();
        this.updateObstacles();
        this.updateBackground();
        this.updateScore();
        
        // Increase speed over time
        if (this.score > 0 && this.score % 200 === 0) {
            this.gameSpeed = Math.min(this.gameSpeed + 0.5, 8);
        }
    }
    
    updateDino() {
        // Apply gravity
        this.dino.velocityY += this.gravity;
        this.dino.y += this.dino.velocityY;
        
        // Ground collision
        if (this.dino.y >= this.groundY - this.dino.height) {
            this.dino.y = this.groundY - this.dino.height;
            this.dino.velocityY = 0;
            this.dino.onGround = true;
        }
        
        // Walking animation
        if (this.dino.onGround) {
            this.dino.animationFrame += 0.2;
        }
        
        // Check obstacle collisions
        this.checkCollisions();
    }
    
    updateObstacles() {
        // Create new obstacles
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.createObstacle();
            this.obstacleTimer = 0;
        }
        
        // Move obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            // Move obstacle
            obstacle.x -= this.gameSpeed;
            
            // Animate moving obstacles
            if (obstacle.type === 'moving') {
                obstacle.animationFrame += 0.1;
                obstacle.y = obstacle.baseY + Math.sin(obstacle.animationFrame) * 10;
            }
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                this.score += 10;
            }
        }
    }
    
    createObstacle() {
        const types = ['low', 'medium', 'high', 'moving'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let obstacle = {
            x: this.canvas.width,
            width: 24,
            type: type,
            animationFrame: 0
        };
        
        switch (type) {
            case 'low':
                obstacle.height = 20;
                obstacle.y = this.groundY - obstacle.height;
                break;
            case 'medium':
                obstacle.height = 35;
                obstacle.y = this.groundY - obstacle.height;
                break;
            case 'high':
                obstacle.height = 50;
                obstacle.y = this.groundY - obstacle.height;
                break;
            case 'moving':
                obstacle.height = 30;
                obstacle.baseY = this.groundY - obstacle.height;
                obstacle.y = obstacle.baseY;
                break;
        }
        
        this.obstacles.push(obstacle);
    }
    
    updateBackground() {
        this.backgroundOffset += this.gameSpeed * 0.5;
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x < -cloud.size) {
                cloud.x = this.canvas.width + cloud.size;
            }
        });
    }
    
    checkCollisions() {
        this.obstacles.forEach((obstacle) => {
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
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dinoHighScore', this.highScore);
            this.updateHighScore();
        }
        
        // Show game over message with share option
        setTimeout(() => {
            const shareOption = confirm(`🦕 Game Over!\n\nScore: ${this.score}\nHigh Score: ${this.highScore}\n\nClick OK to restart, or Cancel to share your score!`);
            
            if (shareOption) {
                this.restart();
            } else {
                // Share score
                if (window.shareScore) {
                    window.shareScore(this.score);
                }
                setTimeout(() => this.restart(), 1000);
            }
        }, 100);
        
        console.log('💀 Game Over! Score:', this.score);
    }
    
    restart() {
        this.startGame();
    }
    
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    updateHighScore() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw animated background
        this.drawBackground();
        
        // Draw ground
        this.drawGround();
        
        // Draw dino
        this.drawDino();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw UI
        this.drawUI();
    }
    
    drawBackground() {
        // Draw moving ground pattern
        this.ctx.fillStyle = '#90EE90';
        for (let x = -this.backgroundOffset % 40; x < this.canvas.width + 40; x += 40) {
            this.ctx.fillRect(x, this.groundY, 40, this.canvas.height - this.groundY);
        }
        
        // Draw clouds
        this.clouds.forEach(cloud => {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Cloud shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.beginPath();
            this.ctx.arc(cloud.x + 2, cloud.y + 2, cloud.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawGround() {
        // Ground line with shadow
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();
        
        // Ground shadow
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY + 1);
        this.ctx.lineTo(this.canvas.width, this.groundY + 1);
        this.ctx.stroke();
    }
    
    drawDino() {
        const dino = this.dino;
        
        // Dino shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(dino.x + 2, dino.y + 2, dino.width, dino.height);
        
        // Dino body (pixel art style)
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        
        // Dino belly
        this.ctx.fillStyle = '#66BB6A';
        this.ctx.fillRect(dino.x + 4, dino.y + 8, dino.width - 8, dino.height - 16);
        
        // Dino eye
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(dino.x + 20, dino.y + 6, 6, 6);
        
        // Eye highlight
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(dino.x + 22, dino.y + 7, 2, 2);
        
        // Dino smile
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(dino.x + 16, dino.y + 20, 8, 0, Math.PI);
        this.ctx.stroke();
        
        // Walking animation
        if (this.dino.onGround && this.dino.animationFrame > 0) {
            const legOffset = Math.sin(this.dino.animationFrame) * 3;
            this.ctx.fillStyle = '#2E7D32';
            this.ctx.fillRect(dino.x + 8, dino.y + dino.height, 4, 6 + legOffset);
            this.ctx.fillRect(dino.x + 20, dino.y + dino.height, 4, 6 - legOffset);
        }
    }
    
    drawObstacles() {
        this.obstacles.forEach((obstacle) => {
            // Obstacle shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width, obstacle.height);
            
            // Obstacle body
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Obstacle highlight
            this.ctx.fillStyle = '#A0522D';
            this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
            
            // Moving obstacle trail effect
            if (obstacle.type === 'moving') {
                this.ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
                this.ctx.fillRect(obstacle.x - 10, obstacle.y + obstacle.height - 5, 10, 5);
            }
        });
    }
    
    drawUI() {
        // Score background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 60);
        
        // Score text
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        this.ctx.fillText(`High: ${this.highScore}`, 20, 50);
        
        // Speed indicator
        this.ctx.fillText(`Speed: ${this.gameSpeed.toFixed(1)}`, 20, 70);
        
        // Game over message
        if (!this.gameRunning && this.score > 0) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
            this.ctx.fillRect(this.canvas.width/2 - 120, this.canvas.height/2 - 40, 240, 80);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 5);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Click to restart', this.canvas.width/2, this.canvas.height/2 + 20);
            this.ctx.textAlign = 'left';
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
    window.gameInstance = new DinoRunGame();
    console.log('🦕 DinoRun Pro initialized!');
});
