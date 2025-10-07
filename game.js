// 🦕 DinoRun Pro - Simple & Fun Version
class DinoRunGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.highScore = localStorage.getItem('dinoHighScore') || 0;
        this.gameSpeed = 5;
        
        // Dino
        this.dino = {
            x: 50,
            y: 0,
            width: 40,
            height: 50,
            velocityY: 0,
            onGround: false,
            color: '#4CAF50'
        };
        
        // Obstacles
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 120; // frames
        
        // Ground
        this.groundY = 0;
        
        // Physics
        this.gravity = 0.8;
        this.jumpPower = -15;
        
        // Particles
        this.particles = [];
        
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
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        this.groundY = this.canvas.height - 100;
        this.dino.y = this.groundY - this.dino.height;
        this.dino.onGround = true;
    }
    
    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.jump();
            }
        });
        
        // Touch/Mouse
        this.canvas.addEventListener('click', () => this.jump());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.obstacles = [];
        this.particles = [];
        this.obstacleTimer = 0;
        
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
        
        // Jump particles
        this.createJumpParticles();
    }
    
    createJumpParticles() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.dino.x + this.dino.width / 2,
                y: this.dino.y + this.dino.height,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                life: 30,
                maxLife: 30,
                color: '#FFD700'
            });
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.updateDino();
        this.updateObstacles();
        this.updateParticles();
        this.updateScore();
        
        // Increase speed over time
        if (this.score % 100 === 0 && this.score > 0) {
            this.gameSpeed = Math.min(this.gameSpeed + 0.5, 12);
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
        
        // Check obstacle collision
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
        this.obstacles.forEach((obstacle, index) => {
            obstacle.x -= this.gameSpeed;
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(index, 1);
                this.score += 10;
            }
        });
    }
    
    createObstacle() {
        const height = Math.random() * 30 + 20;
        this.obstacles.push({
            x: this.canvas.width,
            y: this.groundY - height,
            width: 20,
            height: height,
            color: '#8B4513'
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
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
        
        // Show game over message
        setTimeout(() => {
            alert(`🦕 Game Over!\n\nScore: ${this.score}\nHigh Score: ${this.highScore}\n\nClick OK to restart!`);
            this.restart();
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
        
        // Draw ground
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Draw ground line
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();
        
        // Draw dino
        this.drawDino();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw particles
        this.drawParticles();
        
        // Draw score
        this.drawUI();
    }
    
    drawDino() {
        const dino = this.dino;
        
        // Dino body
        this.ctx.fillStyle = dino.color;
        this.ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        
        // Dino eye
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(dino.x + 30, dino.y + 10, 6, 6);
        
        // Dino smile
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(dino.x + 20, dino.y + 25, 8, 0, Math.PI);
        this.ctx.stroke();
        
        // Jump effect
        if (!dino.onGround) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(dino.x - 5, dino.y + dino.height - 10, 10, 5);
        }
    }
    
    drawObstacles() {
        this.obstacles.forEach((obstacle) => {
            // Obstacle
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Obstacle highlight
            this.ctx.fillStyle = '#A0522D';
            this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
        });
    }
    
    drawParticles() {
        this.particles.forEach((particle) => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(particle.x, particle.y, 3, 3);
        });
    }
    
    drawUI() {
        // Score background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 10, 120, 60);
        
        // Score text
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        this.ctx.fillText(`High: ${this.highScore}`, 20, 50);
        
        // Speed indicator
        this.ctx.fillText(`Speed: ${this.gameSpeed.toFixed(1)}`, 20, 70);
        
        // Game over message
        if (!this.gameRunning && this.score > 0) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            this.ctx.fillRect(this.canvas.width/2 - 100, this.canvas.height/2 - 30, 200, 60);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
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
    console.log('🦕 DinoRun Game initialized!');
});
