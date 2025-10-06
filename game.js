class DinoRunPro {
    constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.scoreElement = document.getElementById("score");
    this.highScoreElement = document.getElementById("highScore");
    this.gameOverElement = document.getElementById("gameOver");
    this.finalScoreElement = document.getElementById("finalScore");
    this.restartBtn = document.getElementById("restartBtn");
    this.jumpBtn = document.getElementById("jumpBtn");
    this.nitroBtn = document.getElementById("nitroBtn");
    this.shareBtn = document.getElementById("shareBtn");

        this.gameRunning = false;
        this.score = 0;
    this.highScore = localStorage.getItem("dinoRunProHighScore") || 0;
    this.gameSpeed = 8;
    this.baseGameSpeed = 8;
    this.gravity = 0.9;
    this.jumpPower = -18;

    this.nitroActive = false;
    this.nitroSpeed = 15;
    this.nitroFuel = 100;
    this.maxNitroFuel = 100;

    this.shieldActive = false;
    this.shieldTime = 0;
    this.shieldDuration = 300;

    this.multiJumpActive = false;
    this.multiJumpTime = 0;
    this.multiJumpDuration = 500;

    this.level = 1;
    this.levelUpScore = 1000;

        this.dino = {
      x: 80,
      y: 0, // Will be set properly in init
      width: 50,
      height: 60,
            velocityY: 0,
            isJumping: false,
      groundY: 0, // Will be set properly in init
      jumpCount: 0,
      maxJumps: 1
        };
        
        this.obstacles = [];
    this.powerUps = [];
    this.particles = [];
    this.nitroParticles = [];
        this.obstacleTimer = 0;
    this.obstacleInterval = 80;
    this.powerUpTimer = 0;
    this.powerUpInterval = 300;
        
    this.groundY = this.canvas.height - 60;
    this.backgroundOffset = 0;
        
        this.init();
    }
    
  init() {
    this.highScoreElement.textContent = this.highScore;
    this.setupEventListeners();
    this.resizeCanvas();
    
    // Initialize dino position after canvas is resized
    this.dino.groundY = this.canvas.height - 120;
    this.dino.y = this.dino.groundY;
    
    this.gameLoop();
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const maxWidth = Math.min(900, window.innerWidth - 40);
    const aspectRatio = 900 / 400;

    this.canvas.width = maxWidth;
    this.canvas.height = maxWidth / aspectRatio;

    this.groundY = this.canvas.height - 60;
    this.dino.groundY = this.canvas.height - 120;
    this.dino.y = this.dino.groundY;

    // Only add resize listener once
    if (!this.resizeListenerAdded) {
      window.addEventListener("resize", () => this.resizeCanvas());
      this.resizeListenerAdded = true;
    }
  }
    
    setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                this.jump();
            }
      if (e.code === "ShiftLeft" || e.code === "ArrowRight") {
        e.preventDefault();
        this.activateNitro();
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.code === "ShiftLeft" || e.code === "ArrowRight") {
        e.preventDefault();
        this.deactivateNitro();
      }
    });

    this.jumpBtn.addEventListener("click", () => this.jump());
    this.nitroBtn.addEventListener("click", () => this.activateNitro());
    this.restartBtn.addEventListener("click", () => this.restart());

    this.canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            this.jump();
        });
        
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      if (touchX > this.canvas.width / 2) {
        this.activateNitro();
      } else {
        this.jump();
      }
    });

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.deactivateNitro();
    });

    this.canvas.addEventListener("click", (e) => {
            this.jump();
        });
    }
    
    jump() {
        if (!this.gameRunning) {
            this.startGame();
            return;
        }
        
    if (this.dino.jumpCount < this.dino.maxJumps) {
            this.dino.velocityY = this.jumpPower;
            this.dino.isJumping = true;
      this.dino.jumpCount++;
      this.createJumpParticles();
    }
  }

  activateNitro() {
    if (!this.gameRunning || this.nitroFuel <= 0) return;

    if (!this.nitroActive) {
      this.nitroActive = true;
      this.gameSpeed = this.nitroSpeed;
      this.createNitroParticles();
    }
  }

  deactivateNitro() {
    this.nitroActive = false;
    this.gameSpeed = this.baseGameSpeed;
  }

  createJumpParticles() {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.dino.x + this.dino.width / 2,
        y: this.dino.y + this.dino.height,
        velocityX: (Math.random() - 0.5) * 6,
        velocityY: Math.random() * 3,
        life: 40,
        maxLife: 40,
        size: Math.random() * 5 + 3,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
      });
    }
  }

  createNitroParticles() {
    for (let i = 0; i < 12; i++) {
      this.nitroParticles.push({
        x: this.dino.x,
        y: this.dino.y + Math.random() * this.dino.height,
        velocityX: -Math.random() * 8 - 6,
        velocityY: (Math.random() - 0.5) * 4,
        life: 25,
        maxLife: 25,
        size: Math.random() * 6 + 4,
        color: `hsl(${Math.random() * 30 + 15}, 90%, 60%)`
      });
        }
    }
    
  startGame() {
    this.gameRunning = true;
    this.score = 0;
    this.gameSpeed = 8;
    this.baseGameSpeed = 8;
    this.nitroActive = false;
    this.nitroFuel = 100;
    this.shieldActive = false;
    this.shieldTime = 0;
    this.multiJumpActive = false;
    this.multiJumpTime = 0;
    this.level = 1;
    this.obstacles = [];
    this.powerUps = [];
    this.particles = [];
    this.nitroParticles = [];
    this.obstacleTimer = 0;
    this.powerUpTimer = 0;
    
    // Reset dino position
    this.dino.groundY = this.canvas.height - 120;
    this.dino.y = this.dino.groundY;
    this.dino.velocityY = 0;
    this.dino.isJumping = false;
    this.dino.jumpCount = 0;
    this.dino.maxJumps = 1;
    
    this.gameOverElement.style.display = "none";
    this.updateScore();
    this.updatePowerUpUI();
    
    console.log('Game started! Dino position:', this.dino.x, this.dino.y);
  }
    
    restart() {
        this.startGame();
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.updateDino();
        this.updateObstacles();
    this.updatePowerUps();
    this.updateParticles();
    this.updateNitroParticles();
    this.updatePowerUpsStatus();
        this.checkCollisions();
    this.checkPowerUpCollisions();
        
    this.score += this.nitroActive ? 6 : 3;
        this.updateScore();
        
    if (this.score % this.levelUpScore === 0) {
      this.levelUp();
    }

    if (this.nitroActive && this.nitroFuel > 0) {
      this.nitroFuel -= 0.5;
      if (this.nitroFuel <= 0) {
        this.deactivateNitro();
      }
    } else if (!this.nitroActive && this.nitroFuel < this.maxNitroFuel) {
      this.nitroFuel += 0.2;
    }
    }
    
    updateDino() {
        this.dino.velocityY += this.gravity;
        this.dino.y += this.dino.velocityY;
        
        if (this.dino.y >= this.dino.groundY) {
            this.dino.y = this.dino.groundY;
            this.dino.velocityY = 0;
            this.dino.isJumping = false;
      this.dino.jumpCount = 0;
        }
    }
    
    updateObstacles() {
        this.obstacleTimer++;

        if (this.obstacleTimer >= this.obstacleInterval) {
            this.createObstacle();
            this.obstacleTimer = 0;

      if (this.level > 3 && Math.random() > 0.8) {
        setTimeout(() => this.createObstacle(), 20);
      }
        }
        
        this.obstacles.forEach((obstacle, index) => {
            obstacle.x -= this.gameSpeed;
            
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(index, 1);
            }
        });
    }

  updatePowerUps() {
    this.powerUpTimer++;

    if (this.powerUpTimer >= this.powerUpInterval) {
      this.createPowerUp();
      this.powerUpTimer = 0;
    }

    this.powerUps.forEach((powerUp, index) => {
      powerUp.x -= this.gameSpeed;
      powerUp.rotation += 0.1;

      if (powerUp.x + powerUp.width < 0) {
        this.powerUps.splice(index, 1);
      }
    });
  }

  updateParticles() {
    this.particles.forEach((particle, index) => {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += 0.3;
      particle.life--;

      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });
  }

  updateNitroParticles() {
    if (this.nitroActive && Math.random() > 0.6) {
      this.createNitroParticles();
    }

    this.nitroParticles.forEach((particle, index) => {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.life--;

      if (particle.life <= 0) {
        this.nitroParticles.splice(index, 1);
      }
    });
  }

  updatePowerUpsStatus() {
    if (this.shieldActive) {
      this.shieldTime--;
      if (this.shieldTime <= 0) {
        this.shieldActive = false;
      }
    }

    if (this.multiJumpActive) {
      this.multiJumpTime--;
      if (this.multiJumpTime <= 0) {
        this.multiJumpActive = false;
        this.dino.maxJumps = 1;
      }
    }
  }
    
    createObstacle() {
    const types = [
      "cactus", "rock", "tall-cactus", "banana", "poop", "car", 
      "spike", "fence", "barrel", "robot", "alien", "meteor"
    ];
    const type = types[Math.floor(Math.random() * types.length)];

        const obstacle = {
            x: this.canvas.width,
      y: this.groundY - 50,
      width: 30,
      height: 50,
      type: type,
      rotation: 0
    };

    switch (type) {
      case "tall-cactus":
        obstacle.height = 70;
        obstacle.y = this.groundY - 70;
        break;
      case "rock":
        obstacle.width = 35;
        obstacle.height = 30;
        obstacle.y = this.groundY - 30;
        break;
      case "spike":
        obstacle.height = 60;
        obstacle.y = this.groundY - 60;
        break;
      case "robot":
        obstacle.width = 45;
        obstacle.height = 65;
        obstacle.y = this.groundY - 65;
        break;
      case "meteor":
        obstacle.width = 40;
        obstacle.height = 40;
        obstacle.y = this.groundY - 40;
        break;
    }

        this.obstacles.push(obstacle);
    }

  createPowerUp() {
    const types = ["shield", "nitro", "multiJump"];
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUp = {
      x: this.canvas.width,
      y: this.groundY - 60,
      width: 35,
      height: 35,
      type: type,
      rotation: 0,
      bobOffset: Math.random() * Math.PI * 2
    };

    this.powerUps.push(powerUp);
  }
    
    checkCollisions() {
    if (this.shieldActive) return;

    this.obstacles.forEach((obstacle) => {
      if (
        this.dino.x < obstacle.x + obstacle.width &&
                this.dino.x + this.dino.width > obstacle.x &&
                this.dino.y < obstacle.y + obstacle.height &&
        this.dino.y + this.dino.height > obstacle.y
      ) {
                this.gameOver();
            }
        });
    }

  checkPowerUpCollisions() {
    this.powerUps.forEach((powerUp, index) => {
      if (
        this.dino.x < powerUp.x + powerUp.width &&
        this.dino.x + this.dino.width > powerUp.x &&
        this.dino.y < powerUp.y + powerUp.height &&
        this.dino.y + this.dino.height > powerUp.y
      ) {
        this.collectPowerUp(powerUp.type);
        this.powerUps.splice(index, 1);
      }
    });
  }

  collectPowerUp(type) {
    switch (type) {
      case "shield":
        this.shieldActive = true;
        this.shieldTime = this.shieldDuration;
        break;
      case "nitro":
        this.nitroFuel = Math.min(this.nitroFuel + 50, this.maxNitroFuel);
        break;
      case "multiJump":
        this.multiJumpActive = true;
        this.multiJumpTime = this.multiJumpDuration;
        this.dino.maxJumps = 2;
        break;
    }
    this.updatePowerUpUI();
  }

  levelUp() {
    this.level++;
    this.baseGameSpeed += 1;
    this.gameSpeed = this.baseGameSpeed;
    this.obstacleInterval = Math.max(40, this.obstacleInterval - 5);
    document.getElementById("level").textContent = this.level;
  }
    
    gameOver() {
        this.gameRunning = false;
    const finalScore = Math.floor(this.score / 10);
    this.finalScoreElement.textContent = finalScore;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
      this.highScoreElement.textContent = Math.floor(this.highScore / 10);
      localStorage.setItem("dinoRunProHighScore", this.highScore);
      document.getElementById("newHighScore").textContent = finalScore;
    } else {
      document.getElementById("newHighScore").textContent = "No new record";
    }

    this.gameOverElement.style.display = "block";
    }
    
    updateScore() {
        this.scoreElement.textContent = Math.floor(this.score / 10);
    }

  updatePowerUpUI() {
    const nitroLevel = document.getElementById("nitroLevel");
    const shieldLevel = document.getElementById("shieldLevel");
    const multiJumpLevel = document.getElementById("multiJumpLevel");
    const nitroStatus = document.getElementById("nitroStatus");
    const shieldStatus = document.getElementById("shieldStatus");
    const multiJumpStatus = document.getElementById("multiJumpStatus");

    nitroLevel.textContent = `${Math.floor(this.nitroFuel)}%`;
    shieldLevel.textContent = this.shieldActive ? "Active" : "Off";
    multiJumpLevel.textContent = this.multiJumpActive ? "Active" : "Off";

    nitroStatus.className = `power-up ${this.nitroActive ? 'active' : ''}`;
    shieldStatus.className = `power-up ${this.shieldActive ? 'active' : ''}`;
    multiJumpStatus.className = `power-up ${this.multiJumpActive ? 'active' : ''}`;
  }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
    this.drawBackground();
    this.drawGround();
    this.drawNitroParticles();
    this.drawParticles();
    this.drawDino();
    this.drawObstacles();
    this.drawPowerUps();
    this.drawClouds();
  }

  drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    if (this.nitroActive) {
      gradient.addColorStop(0, "#ff6b6b");
      gradient.addColorStop(0.5, "#ff8e8e");
      gradient.addColorStop(1, "#ffa8a8");
    } else {
      gradient.addColorStop(0, "#87CEEB");
      gradient.addColorStop(0.5, "#98FB98");
      gradient.addColorStop(1, "#90EE90");
    }
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
    this.backgroundOffset += this.gameSpeed * 0.5;
    if (this.backgroundOffset > this.canvas.width) {
      this.backgroundOffset = 0;
    }

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = -1; i < 3; i++) {
      this.ctx.fillRect(
        i * this.canvas.width + this.backgroundOffset,
        0,
        this.canvas.width,
        this.canvas.height * 0.3
      );
    }
  }

  drawGround() {
    this.ctx.fillStyle = "#8B4513";
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
    this.ctx.strokeStyle = this.nitroActive ? "#ff6347" : "#654321";
    this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();
    }
    
    drawDino() {
        const dino = this.dino;
        
    if (this.shieldActive) {
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "#00ff00";
      this.ctx.beginPath();
      this.ctx.arc(
        dino.x + dino.width / 2,
        dino.y + dino.height / 2,
        dino.width / 2 + 10,
        0,
        Math.PI * 2
      );
      this.ctx.strokeStyle = "#00ff00";
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    const dinoGradient = this.ctx.createLinearGradient(dino.x, dino.y, dino.x, dino.y + dino.height);
    if (this.nitroActive) {
      dinoGradient.addColorStop(0, "#ffd700");
      dinoGradient.addColorStop(1, "#ff8c00");
      this.ctx.shadowBlur = 25;
      this.ctx.shadowColor = "#ff6347";
    } else {
      dinoGradient.addColorStop(0, "#4CAF50");
      dinoGradient.addColorStop(1, "#2E7D32");
    }

    this.ctx.fillStyle = dinoGradient;
    this.roundRect(dino.x, dino.y, dino.width, dino.height, 8);

    this.ctx.fillStyle = this.nitroActive ? "#fff59d" : "#66BB6A";
    this.roundRect(dino.x + 30, dino.y - 20, 25, 25, 6);

    this.ctx.fillStyle = "#000";
    this.ctx.beginPath();
    this.ctx.arc(dino.x + 42, dino.y - 8, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#fff";
    this.ctx.beginPath();
    this.ctx.arc(dino.x + 44, dino.y - 10, 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = this.nitroActive ? "#ff8c00" : "#2E7D32";
    const legOffset = this.gameRunning ? Math.sin(Date.now() * 0.01) * 4 : 0;
    this.roundRect(dino.x + 15, dino.y + dino.height, 6, 12, 3);
    this.roundRect(dino.x + 30, dino.y + dino.height + legOffset, 6, 12, 3);

    this.ctx.fillStyle = this.nitroActive ? "#fff59d" : "#66BB6A";
    this.roundRect(dino.x - 15, dino.y + 15, 20, 10, 4);

    this.ctx.shadowBlur = 0;
    }
    
    drawObstacles() {
    this.obstacles.forEach((obstacle) => {
      this.ctx.save();
      this.ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
      this.ctx.rotate(obstacle.rotation);

      switch (obstacle.type) {
        case "cactus":
          this.drawCactus(obstacle);
          break;
        case "rock":
          this.drawRock(obstacle);
          break;
        case "robot":
          this.drawRobot(obstacle);
          break;
        case "meteor":
          this.drawMeteor(obstacle);
          break;
        default:
          this.drawGenericObstacle(obstacle);
      }

      this.ctx.restore();
    });
  }

  drawCactus(obstacle) {
    const gradient = this.ctx.createLinearGradient(-obstacle.width/2, -obstacle.height/2, -obstacle.width/2, obstacle.height/2);
    gradient.addColorStop(0, "#4CAF50");
    gradient.addColorStop(1, "#2E7D32");
    this.ctx.fillStyle = gradient;
    this.roundRect(-obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height, 4);
  }

  drawRock(obstacle) {
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, obstacle.width/2);
    gradient.addColorStop(0, "#9E9E9E");
    gradient.addColorStop(1, "#424242");
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, obstacle.width/2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawRobot(obstacle) {
    const gradient = this.ctx.createLinearGradient(-obstacle.width/2, -obstacle.height/2, -obstacle.width/2, obstacle.height/2);
    gradient.addColorStop(0, "#2196F3");
    gradient.addColorStop(1, "#1976D2");
    this.ctx.fillStyle = gradient;
    this.roundRect(-obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height, 6);

    this.ctx.fillStyle = "#FFD700";
    this.ctx.beginPath();
    this.ctx.arc(-5, -10, 3, 0, Math.PI * 2);
    this.ctx.arc(5, -10, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawMeteor(obstacle) {
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, obstacle.width/2);
    gradient.addColorStop(0, "#FF5722");
    gradient.addColorStop(1, "#D32F2F");
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, obstacle.width/2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawGenericObstacle(obstacle) {
    const gradient = this.ctx.createLinearGradient(-obstacle.width/2, -obstacle.height/2, -obstacle.width/2, obstacle.height/2);
    gradient.addColorStop(0, "#FF9800");
    gradient.addColorStop(1, "#F57C00");
    this.ctx.fillStyle = gradient;
    this.roundRect(-obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height, 4);
  }

  drawPowerUps() {
    this.powerUps.forEach((powerUp) => {
      this.ctx.save();
      this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
      this.ctx.rotate(powerUp.rotation);

      const bobY = Math.sin(powerUp.bobOffset + Date.now() * 0.005) * 5;

      switch (powerUp.type) {
        case "shield":
          this.drawShieldPowerUp(powerUp, bobY);
          break;
        case "nitro":
          this.drawNitroPowerUp(powerUp, bobY);
          break;
        case "multiJump":
          this.drawMultiJumpPowerUp(powerUp, bobY);
          break;
      }

      this.ctx.restore();
    });
  }

  drawShieldPowerUp(powerUp, bobY) {
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#00ff00";
    this.ctx.fillStyle = "#00ff00";
    this.ctx.beginPath();
    this.ctx.arc(0, bobY, powerUp.width/2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  drawNitroPowerUp(powerUp, bobY) {
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#ff6b6b";
    this.ctx.fillStyle = "#ff6b6b";
    this.roundRect(-powerUp.width/2, bobY - powerUp.height/2, powerUp.width, powerUp.height, 4);
    this.ctx.shadowBlur = 0;
  }

  drawMultiJumpPowerUp(powerUp, bobY) {
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#ffd700";
    this.ctx.fillStyle = "#ffd700";
    this.ctx.beginPath();
    this.ctx.arc(0, bobY, powerUp.width/2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    });
  }

  drawNitroParticles() {
    this.nitroParticles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
        });
    }
    
    drawClouds() {
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
        
        const time = Date.now() * 0.0005;
    for (let i = 0; i < 5; i++) {
      const x = ((i * 200 + time * 50) % (this.canvas.width + 100)) - 50;
      const y = 30 + i * 20;
            
            this.ctx.beginPath();
      this.ctx.arc(x, y, 18, 0, Math.PI * 2);
      this.ctx.arc(x + 25, y, 22, 0, Math.PI * 2);
      this.ctx.arc(x + 50, y, 18, 0, Math.PI * 2);
            this.ctx.fill();
        }

    this.ctx.shadowBlur = 0;
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener("DOMContentLoaded", () => {
  window.gameInstance = new DinoRunPro();
});
