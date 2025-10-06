class DinoRunGame {
    constructor() {
    this.canvas = document.getElementById("gameCanvas")
    this.ctx = this.canvas.getContext("2d")
    this.scoreElement = document.getElementById("score")
    this.highScoreElement = document.getElementById("highScore")
    this.gameOverElement = document.getElementById("gameOver")
    this.finalScoreElement = document.getElementById("finalScore")
    this.restartBtn = document.getElementById("restartBtn")
    this.jumpBtn = document.getElementById("jumpBtn")
    this.shareBtn = document.getElementById("shareBtn")

    this.gameRunning = false
    this.score = 0
    this.highScore = localStorage.getItem("dinoRunHighScore") || 0
    this.gameSpeed = 6 // Increased base speed from 4 to 6 for faster gameplay
    this.baseGameSpeed = 6
    this.gravity = 0.8
    this.jumpPower = -16

    this.nitroActive = false
    this.nitroSpeed = 12 // Speed when nitro is active
    this.nitroParticles = []

    this.touchStartY = 0
    this.touchEndY = 0
    this.touchStartX = 0
    this.touchEndX = 0
    this.isTouching = false
        
        // Dino properties
        this.dino = {
            x: 50,
            y: this.canvas.height - 100,
            width: 40,
            height: 50,
            velocityY: 0,
            isJumping: false,
      groundY: this.canvas.height - 100,
    }
        
        // Obstacles array
    this.obstacles = []
    this.obstacleTimer = 0
    this.obstacleInterval = 70 // Reduced from 120 for more frequent spawning
        
        // Ground
    this.groundY = this.canvas.height - 50

    this.particles = []
        
    this.init()
    }
    
    init() {
    this.highScoreElement.textContent = this.highScore
    this.setupEventListeners()
    this.resizeCanvas()
    this.gameLoop()
  }

  resizeCanvas() {
    const container = this.canvas.parentElement
    const maxWidth = Math.min(800, window.innerWidth - 40)
    const aspectRatio = 2 // 800:400

    this.canvas.width = maxWidth
    this.canvas.height = maxWidth / aspectRatio

    // Update ground and dino positions based on new canvas size
    this.groundY = this.canvas.height - 50
    this.dino.groundY = this.canvas.height - 100
    this.dino.y = this.dino.groundY

    window.addEventListener("resize", () => {
      this.resizeCanvas()
    })
    }
    
    setupEventListeners() {
        // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        this.jump()
      }
      if (e.code === "ArrowRight") {
        e.preventDefault()
        this.activateNitro()
      }
    })

    document.addEventListener("keyup", (e) => {
      if (e.code === "ArrowRight") {
        e.preventDefault()
        this.deactivateNitro()
      }
    })
        
        // Mouse/touch controls
    this.jumpBtn.addEventListener("click", () => this.jump())
    this.restartBtn.addEventListener("click", () => this.restart())

    if (this.shareBtn) {
      this.shareBtn.addEventListener("click", () => this.shareScore())
    }

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.isTouching = true
      this.touchStartY = e.touches[0].clientY
      this.touchStartX = e.touches[0].clientX
      this.jump()
    })

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault()
      if (this.isTouching) {
        this.touchEndY = e.touches[0].clientY
        this.touchEndX = e.touches[0].clientX

        const swipeDistance = this.touchEndX - this.touchStartX
        if (swipeDistance > 50) {
          this.activateNitro()
        }
      }
    })

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault()
      this.isTouching = false
      this.deactivateNitro()
    })

    this.canvas.addEventListener("click", (e) => {
      this.jump()
    })

    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault()
    })
  }

  activateNitro() {
    if (!this.gameRunning) return

    if (!this.nitroActive) {
      this.nitroActive = true
      this.gameSpeed = this.nitroSpeed
      this.createNitroParticles()
    }
  }

  deactivateNitro() {
    this.nitroActive = false
    this.gameSpeed = this.baseGameSpeed
  }

  createNitroParticles() {
    for (let i = 0; i < 8; i++) {
      this.nitroParticles.push({
        x: this.dino.x,
        y: this.dino.y + Math.random() * this.dino.height,
        velocityX: -Math.random() * 6 - 4,
        velocityY: (Math.random() - 0.5) * 3,
        life: 20,
        maxLife: 20,
        size: Math.random() * 5 + 3,
      })
    }
  }

  updateNitroParticles() {
    // Create new nitro particles while active
    if (this.nitroActive && Math.random() > 0.5) {
      this.createNitroParticles()
    }

    this.nitroParticles.forEach((particle, index) => {
      particle.x += particle.velocityX
      particle.y += particle.velocityY
      particle.life--

      if (particle.life <= 0) {
        this.nitroParticles.splice(index, 1)
      }
    })
  }

  drawNitroParticles() {
    this.nitroParticles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife
      const gradient = this.ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size)
      gradient.addColorStop(0, `rgba(255, 165, 0, ${alpha})`)
      gradient.addColorStop(0.5, `rgba(255, 69, 0, ${alpha})`)
      gradient.addColorStop(1, `rgba(255, 0, 0, ${alpha * 0.5})`)

      this.ctx.fillStyle = gradient
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fill()
    })
    }
    
    jump() {
        if (!this.gameRunning) {
      this.startGame()
      return
        }
        
        if (!this.dino.isJumping) {
      this.dino.velocityY = this.jumpPower
      this.dino.isJumping = true
      this.createJumpParticles()
    }
  }

  createJumpParticles() {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.dino.x + this.dino.width / 2,
        y: this.dino.y + this.dino.height,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: Math.random() * 2,
        life: 30,
        maxLife: 30,
        size: Math.random() * 4 + 2,
      })
    }
  }

  updateParticles() {
    this.particles.forEach((particle, index) => {
      particle.x += particle.velocityX
      particle.y += particle.velocityY
      particle.velocityY += 0.2
      particle.life--

      if (particle.life <= 0) {
        this.particles.splice(index, 1)
      }
    })
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife
      this.ctx.fillStyle = `rgba(52, 152, 219, ${alpha})`
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fill()
    })
  }

  startGame() {
    this.gameRunning = true
    this.score = 0
    this.gameSpeed = 6
    this.baseGameSpeed = 6
    this.nitroActive = false
    this.obstacles = []
    this.particles = []
    this.nitroParticles = []
    this.obstacleTimer = 0
    this.dino.y = this.dino.groundY
    this.dino.velocityY = 0
    this.dino.isJumping = false
    this.gameOverElement.style.display = "none"
    this.updateScore()
    }
    
    restart() {
    this.startGame()
    }
    
    update() {
    if (!this.gameRunning) return

    this.updateDino()
    this.updateObstacles()
    this.updateParticles()
    this.updateNitroParticles()
    this.checkCollisions()

    this.score += this.nitroActive ? 4 : 2
    this.updateScore()

    if (this.score % 500 === 0) {
      this.baseGameSpeed += 0.3
      if (!this.nitroActive) {
        this.gameSpeed = this.baseGameSpeed
      }
        }
    }
    
    updateDino() {
        // Apply gravity
    this.dino.velocityY += this.gravity
    this.dino.y += this.dino.velocityY
        
        // Ground collision
        if (this.dino.y >= this.dino.groundY) {
      this.dino.y = this.dino.groundY
      this.dino.velocityY = 0
      this.dino.isJumping = false
        }
    }
    
    updateObstacles() {
        // Create new obstacles
    this.obstacleTimer++

    const dynamicInterval = Math.max(30, this.obstacleInterval - Math.floor(this.score / 500))

    if (this.obstacleTimer >= dynamicInterval) {
      this.createObstacle()
      this.obstacleTimer = 0

      if (this.score > 2000 && Math.random() > 0.7) {
        setTimeout(() => {
          this.createObstacle()
        }, 15)
      }
        }
        
        // Move obstacles
        this.obstacles.forEach((obstacle, index) => {
      obstacle.x -= this.gameSpeed
            
            if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(index, 1)
            }
    })
    }
    
    createObstacle() {
    const types = ["cactus", "rock", "tall-cactus", "banana", "poop", "car"]
    const type = types[Math.floor(Math.random() * types.length)]

        const obstacle = {
            x: this.canvas.width,
            y: this.groundY - 40,
            width: 20,
            height: 40,
      type: type,
    }

    if (type === "tall-cactus") {
      obstacle.height = 60
      obstacle.y = this.groundY - 60
    } else if (type === "rock") {
      obstacle.width = 30
      obstacle.height = 25
      obstacle.y = this.groundY - 25
    } else if (type === "banana") {
      obstacle.width = 25
      obstacle.height = 30
      obstacle.y = this.groundY - 30
    } else if (type === "poop") {
      obstacle.width = 28
      obstacle.height = 35
      obstacle.y = this.groundY - 35
    } else if (type === "car") {
      obstacle.width = 50
      obstacle.height = 40
      obstacle.y = this.groundY - 40
    }

    this.obstacles.push(obstacle)
    }
    
    checkCollisions() {
    this.obstacles.forEach((obstacle) => {
      if (
        this.dino.x < obstacle.x + obstacle.width &&
                this.dino.x + this.dino.width > obstacle.x &&
                this.dino.y < obstacle.y + obstacle.height &&
        this.dino.y + this.dino.height > obstacle.y
      ) {
        this.gameOver()
            }
    })
    }
    
    gameOver() {
    this.gameRunning = false
    this.finalScoreElement.textContent = Math.floor(this.score / 10)
        
        if (this.score > this.highScore) {
      this.highScore = this.score
      this.highScoreElement.textContent = Math.floor(this.highScore / 10)
      localStorage.setItem("dinoRunHighScore", this.highScore)
    }

    this.gameOverElement.style.display = "block"
    }
    
    updateScore() {
    this.scoreElement.textContent = Math.floor(this.score / 10)
    }
    
    draw() {
        // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    if (this.nitroActive) {
      gradient.addColorStop(0, "#ff6b6b")
      gradient.addColorStop(1, "#ee5a6f")
    } else {
      gradient.addColorStop(0, "#667eea")
      gradient.addColorStop(1, "#764ba2")
    }
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.fillStyle = "#2d3748"
    this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY)

    this.ctx.shadowBlur = 10
    this.ctx.shadowColor = this.nitroActive ? "#ff6347" : "#4299e1"
    this.ctx.strokeStyle = this.nitroActive ? "#ff6347" : "#4299e1"
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(0, this.groundY)
    this.ctx.lineTo(this.canvas.width, this.groundY)
    this.ctx.stroke()
    this.ctx.shadowBlur = 0

    this.drawNitroParticles()
    this.drawDino()
    this.drawObstacles()
    this.drawParticles()
    this.drawClouds()
    }
    
    drawDino() {
    const dino = this.dino

    const dinoGradient = this.ctx.createLinearGradient(dino.x, dino.y, dino.x, dino.y + dino.height)
    if (this.nitroActive) {
      dinoGradient.addColorStop(0, "#ffd700")
      dinoGradient.addColorStop(1, "#ffa500")

      // Add glow effect when nitro is active
      this.ctx.shadowBlur = 20
      this.ctx.shadowColor = "#ff6347"
    } else {
      dinoGradient.addColorStop(0, "#48bb78")
      dinoGradient.addColorStop(1, "#38a169")
    }

    // Dino body with rounded corners
    this.ctx.fillStyle = dinoGradient
    this.roundRect(dino.x, dino.y, dino.width, dino.height, 5)
        
        // Dino head
    this.ctx.fillStyle = this.nitroActive ? "#ffed4e" : "#68d391"
    this.roundRect(dino.x + 25, dino.y - 15, 20, 20, 5)

    // Dino eye with white highlight
    this.ctx.fillStyle = "#000"
    this.ctx.beginPath()
    this.ctx.arc(dino.x + 37, dino.y - 8, 3, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = "#fff"
    this.ctx.beginPath()
    this.ctx.arc(dino.x + 38, dino.y - 9, 1, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = this.nitroActive ? "#ffa500" : "#38a169"
    const legOffset = this.gameRunning ? Math.sin(Date.now() * (this.nitroActive ? 0.04 : 0.02)) * 3 : 0
    this.roundRect(dino.x + 10, dino.y + dino.height, 5, 10, 2)
    this.roundRect(dino.x + 25, dino.y + dino.height + legOffset, 5, 10, 2)
        
        // Dino tail
    this.ctx.fillStyle = this.nitroActive ? "#ffed4e" : "#68d391"
    this.roundRect(dino.x - 10, dino.y + 10, 15, 8, 3)

    this.ctx.shadowBlur = 0
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
    this.ctx.fill()
    }
    
    drawObstacles() {
    this.obstacles.forEach((obstacle) => {
      const obstacleGradient = this.ctx.createLinearGradient(
        obstacle.x,
        obstacle.y,
        obstacle.x,
        obstacle.y + obstacle.height,
      )

      if (obstacle.type === "rock") {
        obstacleGradient.addColorStop(0, "#718096")
        obstacleGradient.addColorStop(1, "#4a5568")
        this.ctx.fillStyle = obstacleGradient
        this.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5)
      } else if (obstacle.type === "banana") {
        const bananaGradient = this.ctx.createLinearGradient(
          obstacle.x,
          obstacle.y,
          obstacle.x,
          obstacle.y + obstacle.height,
        )
        bananaGradient.addColorStop(0, "#ffd700")
        bananaGradient.addColorStop(1, "#ffb700")
        this.ctx.fillStyle = bananaGradient

        // Banana peel shape
        this.ctx.beginPath()
        this.ctx.ellipse(obstacle.x + 12, obstacle.y + 15, 12, 15, Math.PI / 6, 0, Math.PI * 2)
        this.ctx.fill()

        // Banana peel details
        this.ctx.strokeStyle = "#cc9900"
        this.ctx.lineWidth = 2
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 8, obstacle.y + 10, 5, 0, Math.PI)
        this.ctx.stroke()
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 16, obstacle.y + 20, 5, 0, Math.PI)
        this.ctx.stroke()
      } else if (obstacle.type === "poop") {
        const poopGradient = this.ctx.createRadialGradient(
          obstacle.x + 14,
          obstacle.y + 17,
          5,
          obstacle.x + 14,
          obstacle.y + 17,
          20,
        )
        poopGradient.addColorStop(0, "#8b4513")
        poopGradient.addColorStop(1, "#654321")
        this.ctx.fillStyle = poopGradient

        // Bottom swirl
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 14, obstacle.y + 25, 12, 0, Math.PI * 2)
        this.ctx.fill()

        // Middle swirl
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 14, obstacle.y + 15, 10, 0, Math.PI * 2)
        this.ctx.fill()

        // Top swirl
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 14, obstacle.y + 7, 7, 0, Math.PI * 2)
        this.ctx.fill()

        // Eyes
        this.ctx.fillStyle = "#fff"
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 10, obstacle.y + 20, 3, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 18, obstacle.y + 20, 3, 0, Math.PI * 2)
        this.ctx.fill()

        this.ctx.fillStyle = "#000"
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 10, obstacle.y + 20, 1.5, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 18, obstacle.y + 20, 1.5, 0, Math.PI * 2)
        this.ctx.fill()
      } else if (obstacle.type === "car") {
        const carGradient = this.ctx.createLinearGradient(
          obstacle.x,
          obstacle.y,
          obstacle.x,
          obstacle.y + obstacle.height,
        )
        carGradient.addColorStop(0, "#e74c3c")
        carGradient.addColorStop(1, "#c0392b")
        this.ctx.fillStyle = carGradient

        // Car body
        this.roundRect(obstacle.x, obstacle.y + 15, obstacle.width, 20, 3)

        // Car roof
        this.ctx.fillStyle = "#c0392b"
        this.roundRect(obstacle.x + 10, obstacle.y, 30, 18, 5)

        // Windows
        this.ctx.fillStyle = "rgba(135, 206, 250, 0.6)"
        this.roundRect(obstacle.x + 12, obstacle.y + 3, 12, 12, 2)
        this.roundRect(obstacle.x + 26, obstacle.y + 3, 12, 12, 2)

        // Wheels
        this.ctx.fillStyle = "#2c3e50"
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 12, obstacle.y + 35, 5, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 38, obstacle.y + 35, 5, 0, Math.PI * 2)
        this.ctx.fill()

        // Wheel rims
        this.ctx.fillStyle = "#95a5a6"
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 12, obstacle.y + 35, 2, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.beginPath()
        this.ctx.arc(obstacle.x + 38, obstacle.y + 35, 2, 0, Math.PI * 2)
        this.ctx.fill()
      } else {
        // Cactus
        obstacleGradient.addColorStop(0, "#48bb78")
        obstacleGradient.addColorStop(1, "#2f855a")
        this.ctx.fillStyle = obstacleGradient
        this.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 3)
            
            // Cactus arms
        this.roundRect(obstacle.x - 5, obstacle.y + 10, 8, 15, 2)
        this.roundRect(obstacle.x + obstacle.width - 3, obstacle.y + 5, 8, 12, 2)
      }
    })
    }
    
    drawClouds() {
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    this.ctx.shadowBlur = 15
    this.ctx.shadowColor = "rgba(255, 255, 255, 0.5)"

    const time = Date.now() * 0.0003
    for (let i = 0; i < 4; i++) {
      const x = ((i * 250 + time * 30) % (this.canvas.width + 100)) - 50
      const y = 40 + i * 25

      this.ctx.beginPath()
      this.ctx.arc(x, y, 15, 0, Math.PI * 2)
      this.ctx.arc(x + 20, y, 20, 0, Math.PI * 2)
      this.ctx.arc(x + 40, y, 15, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.ctx.shadowBlur = 0
    }
    
    gameLoop() {
    this.update()
    this.draw()
    requestAnimationFrame(() => this.gameLoop())
  }

  shareScore() {
    const score = Math.floor(this.score / 10)
    
    // Use Farcaster SDK if available
    if (window.shareScoreToFarcaster) {
      window.shareScoreToFarcaster(score)
    } else {
      // Fallback to regular sharing
      const text = `I just scored ${score} points in DinoRun! 🦕 Can you beat my score?`
      const url = window.location.href

      if (navigator.share) {
        navigator
          .share({
            title: "DinoRun Score",
            text: text,
            url: url,
          })
          .catch((err) => console.log("Error sharing:", err))
      } else {
        const shareText = `${text}\n${url}`
        navigator.clipboard
          .writeText(shareText)
          .then(() => {
            alert("Score copied to clipboard! Share it on Farcaster!")
          })
          .catch((err) => {
            console.log("Error copying to clipboard:", err)
          })
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new DinoRunGame()
})
