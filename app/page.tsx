"use client"

import { useEffect, useRef, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import { getWalletClient, getPublicClient, switchToBaseNetwork } from "@/lib/web3"
import { DINO_NFT_CONTRACT } from "@/lib/contract"

type Point = { x: number; y: number }
type Dir = "up" | "down" | "left" | "right"

const GRID_WIDTH = 20
const GRID_HEIGHT = 12
const CELL = 25
const INITIAL_SPEED = 120
const GRAVITY = 0.8
const JUMP_FORCE = -12

export default function Page() {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Farcaster context kontrolü
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          })
          if (accounts && accounts.length > 0) {
            setUserAddress(accounts[0])
            setIsConnected(true)
          }
        }
        
        // Farcaster'a uygulamanın hazır olduğunu bildir
        await sdk.actions.ready()
      } catch (error) {
        console.log("Not in Farcaster context or wallet not connected")
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })
        if (accounts && accounts.length > 0) {
          setUserAddress(accounts[0])
          setIsConnected(true)
        }
      } else {
        setUserAddress("0x" + Math.random().toString(16).slice(2, 42))
        setIsConnected(true)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const shareScore = async (score: number) => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : ""
      const shareText = `Just scored ${score} points in Dino Game! Can you beat my score?`
      const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(url)}`
      window.open(farcasterUrl, "_blank")
    } catch (error) {
      console.error("Failed to share score:", error)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4 overflow-auto">
      {isLoading ? (
        <div className="text-center">
          <div className="text-8xl animate-pulse">🦕</div>
          <p className="text-xl mt-5 text-foreground/80">Loading Dino Game...</p>
        </div>
      ) : !isConnected ? (
        <Gate onConnect={connectWallet} />
      ) : (
        <Game onShare={shareScore} playerAddress={userAddress ?? undefined} />
      )}
    </main>
  )
}

function Gate({ onConnect }: { onConnect: () => void }) {
  return (
    <section className="grid gap-8 place-items-center text-center max-w-2xl px-4">
      <div className="text-8xl animate-bounce">🦕</div>
      <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
        Dino Game
      </h1>
      <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-lg">
        Classic dino running game with modern graphics. Connect your wallet to start playing and mint your high scores as NFTs!
      </p>
      <button
        onClick={onConnect}
        className="px-10 py-5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg font-bold cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
      >
        Connect Wallet
      </button>
      <div className="flex gap-4 text-sm text-foreground/60">
        <div className="flex items-center gap-2">
          <span>⌨️</span>
          <span>Keyboard</span>
        </div>
        <div className="flex items-center gap-2">
          <span>👆</span>
          <span>Touch</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🎮</span>
          <span>Space/Jump</span>
        </div>
      </div>
    </section>
  )
}

function Game({ onShare, playerAddress }: { onShare: (score: number) => void; playerAddress?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dino, setDino] = useState<Point>({ x: 3, y: 8 })
  const [dinoVelocity, setDinoVelocity] = useState(0)
  const [obstacles, setObstacles] = useState<Point[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showNFTPrompt, setShowNFTPrompt] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintStatus, setMintStatus] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")
  const [isJumping, setIsJumping] = useState(false)

  const generateObstacle = () => {
    return {
      x: GRID_WIDTH - 1,
      y: GRID_HEIGHT - 2, // Ground level
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return
      const key = e.key
      if ((key === " " || key === "ArrowUp" || key === "w") && !isJumping) {
        setIsJumping(true)
        setDinoVelocity(JUMP_FORCE)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [gameStarted, gameOver, isJumping])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (!gameStarted || gameOver) return
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!gameStarted || gameOver) return
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const dx = touchEndX - touchStartX
      const dy = touchEndY - touchStartY

      // Any significant touch movement triggers jump
      if ((Math.abs(dx) > 30 || Math.abs(dy) > 30) && !isJumping) {
        setIsJumping(true)
        setDinoVelocity(JUMP_FORCE)
      }
    }

    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchend", handleTouchEnd)
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [gameStarted, gameOver])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const interval = setInterval(() => {
      // Update dino physics
      setDino((prevDino) => {
        const newY = prevDino.y + dinoVelocity * 0.1
        const newVelocity = dinoVelocity + GRAVITY * 0.1
        
        // Ground collision
        if (newY >= GRID_HEIGHT - 2) {
          setIsJumping(false)
          setDinoVelocity(0)
          return { ...prevDino, y: GRID_HEIGHT - 2 }
        }
        
        setDinoVelocity(newVelocity)
        return { ...prevDino, y: newY }
      })

      // Move obstacles
      setObstacles((prevObstacles) => {
        const newObstacles = prevObstacles
          .map(obs => ({ ...obs, x: obs.x - 0.1 }))
          .filter(obs => obs.x > -1) // Remove obstacles that are off screen

        // Add new obstacles randomly
        if (Math.random() < 0.02) { // 2% chance each frame
          newObstacles.push(generateObstacle())
        }

        return newObstacles
      })

      // Check collisions
      obstacles.forEach(obstacle => {
        if (Math.abs(dino.x - obstacle.x) < 1 && Math.abs(dino.y - obstacle.y) < 1) {
          setGameOver(true)
          if (score >= 30) {
            setShowNFTPrompt(true)
          }
          if (score > highScore) setHighScore(score)
        }
      })

      // Increase score over time
      setScore(prev => prev + 1)
      setSpeed(prev => Math.max(50, prev - 0.5)) // Gradually increase speed

    }, speed)

    return () => clearInterval(interval)
  }, [gameStarted, gameOver, dinoVelocity, dino, obstacles, speed, score, highScore])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Sky gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    bgGradient.addColorStop(0, "#87CEEB") // Sky blue
    bgGradient.addColorStop(1, "#98FB98") // Light green
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw ground
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(0, (GRID_HEIGHT - 1) * CELL, canvas.width, CELL)

    // Draw dino
    const dinoX = dino.x * CELL
    const dinoY = dino.y * CELL
    
    // Dino body
    const dinoGrad = ctx.createLinearGradient(dinoX, dinoY, dinoX + CELL, dinoY + CELL)
    dinoGrad.addColorStop(0, "#228B22") // Forest green
    dinoGrad.addColorStop(1, "#006400") // Dark green
    ctx.fillStyle = dinoGrad
    ctx.shadowColor = "rgba(34, 139, 34, 0.5)"
    ctx.shadowBlur = 10
    ctx.fillRect(dinoX + 2, dinoY + 2, CELL - 4, CELL - 4)
    ctx.shadowBlur = 0

    // Dino eye
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(dinoX + CELL * 0.7, dinoY + CELL * 0.3, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#000"
    ctx.beginPath()
    ctx.arc(dinoX + CELL * 0.7, dinoY + CELL * 0.3, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Draw obstacles
    obstacles.forEach(obstacle => {
      const obsX = obstacle.x * CELL
      const obsY = obstacle.y * CELL
      
      // Cactus-like obstacle
      const obsGrad = ctx.createLinearGradient(obsX, obsY, obsX + CELL, obsY + CELL)
      obsGrad.addColorStop(0, "#654321")
      obsGrad.addColorStop(1, "#8B4513")
      ctx.fillStyle = obsGrad
      ctx.shadowColor = "rgba(139, 69, 19, 0.5)"
      ctx.shadowBlur = 8
      ctx.fillRect(obsX + 4, obsY - CELL + 4, CELL - 8, CELL * 2 - 8)
      ctx.shadowBlur = 0
    })

    // Draw clouds
    for (let i = 0; i < 3; i++) {
      const cloudX = (i * 200 + Date.now() * 0.01) % (canvas.width + 100) - 50
      const cloudY = 50 + i * 30
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.beginPath()
      ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2)
      ctx.arc(cloudX + 25, cloudY, 25, 0, Math.PI * 2)
      ctx.arc(cloudX + 50, cloudY, 20, 0, Math.PI * 2)
      ctx.arc(cloudX + 25, cloudY - 15, 15, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [dino, obstacles])

  const startGame = () => {
    setDino({ x: 3, y: GRID_HEIGHT - 2 })
    setDinoVelocity(0)
    setObstacles([])
    setIsJumping(false)
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setGameOver(false)
    setGameStarted(true)
    setShowNFTPrompt(false)
    setMintStatus("")
    setTxHash("")
  }

  const handleJump = () => {
    if (!isJumping && gameStarted && !gameOver) {
      setIsJumping(true)
      setDinoVelocity(JUMP_FORCE)
    }
  }

  const handleMintNFT = async () => {
    setIsMinting(true)
    setMintStatus("Checking network...")

    console.log("[v0] Starting NFT mint process")
    console.log("[v0] Player address:", playerAddress)
    console.log("[v0] Score:", score)
    console.log("[v0] Contract address:", DINO_NFT_CONTRACT.address)

    try {
      if (DINO_NFT_CONTRACT.address === "0x0000000000000000000000000000000000000000") {
        console.log("[v0] ERROR: Contract not deployed")
        setMintStatus(
          "⚠️ Contract not deployed! Please deploy the smart contract first and update the address in lib/contract.ts",
        )
        setTimeout(() => {
          setIsMinting(false)
        }, 5000)
        return
      }

      if (typeof window === "undefined" || !(window as any).ethereum) {
        console.log("[v0] ERROR: No ethereum provider found")
        setMintStatus("⚠️ No wallet detected. Please install MetaMask or use a Web3 browser.")
        setTimeout(() => {
          setIsMinting(false)
          setMintStatus("")
        }, 3000)
        return
      }

      // Switch to Base network
      console.log("[v0] Switching to Base Sepolia network...")
      setMintStatus("Switching to Base network...")
      await switchToBaseNetwork()
      console.log("[v0] Network switched successfully")

      // Get wallet client
      console.log("[v0] Getting wallet client...")
      setMintStatus("Preparing transaction...")
      const walletClient = getWalletClient()
      const [address] = await walletClient.getAddresses()
      console.log("[v0] Wallet address:", address)

      // Call mintScore function
      console.log("[v0] Calling mintScore with score:", score)
      setMintStatus("Waiting for confirmation...")
      const hash = await walletClient.writeContract({
        address: DINO_NFT_CONTRACT.address as `0x${string}`,
        abi: DINO_NFT_CONTRACT.abi,
        functionName: "mintScore",
        args: [BigInt(score)],
        account: address,
      })

      console.log("[v0] Transaction hash:", hash)
      setTxHash(hash)
      setMintStatus("Confirming transaction...")

      // Wait for transaction confirmation
      const publicClient = getPublicClient()
      console.log("[v0] Waiting for transaction receipt...")
      await publicClient.waitForTransactionReceipt({ hash })

      console.log("[v0] NFT minted successfully!")
      setMintStatus("✅ NFT Minted Successfully!")
      setTimeout(() => {
        setShowNFTPrompt(false)
        setIsMinting(false)
        setMintStatus("")
      }, 3000)
    } catch (error: any) {
      console.error("[v0] Failed to mint NFT:", error)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error code:", error.code)

      if (error.message?.includes("User rejected") || error.code === 4001) {
        setMintStatus("❌ Transaction rejected by user")
      } else if (error.message?.includes("Score must be at least 30")) {
        setMintStatus("❌ Score must be at least 30 to mint")
      } else if (error.message?.includes("No ethereum provider")) {
        setMintStatus("❌ No wallet detected. Please install MetaMask.")
      } else if (error.code === -32603) {
        setMintStatus("❌ Contract error. Make sure the contract is deployed correctly.")
      } else {
        setMintStatus(`❌ Failed to mint: ${error.message?.slice(0, 50) || "Unknown error"}`)
      }

      setTimeout(() => {
        setIsMinting(false)
        setMintStatus("")
      }, 5000)
    }
  }

  return (
    <section className="flex flex-col gap-4 items-center p-4 bg-card/50 backdrop-blur-xl rounded-3xl shadow-2xl max-w-full w-fit border border-border/50">
      <header className="text-center w-full">
        <h1 className="text-4xl font-black text-foreground">🦕 Dino</h1>
        <div className="flex gap-8 justify-center mt-3">
          <div>
            <div className="text-sm text-muted-foreground">Score</div>
            <div className="text-3xl font-bold text-primary">{score}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Best</div>
            <div className="text-3xl font-bold text-accent">{highScore}</div>
          </div>
        </div>
        {playerAddress && (
          <div className="text-xs text-muted-foreground mt-2">
            {playerAddress.slice(0, 6)}...{playerAddress.slice(-4)}
          </div>
        )}
      </header>

      <canvas
        ref={canvasRef}
        width={GRID_WIDTH * CELL}
        height={GRID_HEIGHT * CELL}
        className="border-4 border-border/30 rounded-2xl shadow-xl max-w-full h-auto"
      />

      {!gameStarted && !gameOver && (
        <div className="text-center p-6 bg-muted/50 backdrop-blur-md rounded-2xl">
          <p className="text-lg mb-2 text-foreground">Ready to play?</p>
          <p className="text-sm text-muted-foreground">Press Space, Up Arrow, or swipe to jump over obstacles!</p>
        </div>
      )}

      {gameOver && (
        <div className="text-center p-8 bg-gradient-to-br from-destructive/20 to-accent/20 backdrop-blur-md rounded-2xl border border-border/50 max-w-md">
          <h2 className="text-3xl font-black mb-3 text-foreground">Game Over!</h2>
          <p className="text-2xl text-primary mb-2">Score: {score}</p>
          {score === highScore && score > 0 && <p className="text-lg text-accent mb-4">🎉 New High Score!</p>}

          {showNFTPrompt && !isMinting && !mintStatus && (
            <div className="mt-6 p-4 bg-card/80 rounded-xl border border-primary/30">
              <p className="text-base text-foreground mb-3">
                Great score! Would you like to mint this as an NFT memory?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleMintNFT}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  🎨 Mint NFT
                </button>
                <button
                  onClick={() => setShowNFTPrompt(false)}
                  className="px-6 py-3 rounded-full bg-muted text-muted-foreground font-bold transition-all duration-300 hover:scale-105"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}

          {(isMinting || mintStatus) && (
            <div className="mt-6 p-4 bg-card/80 rounded-xl">
              <div className="animate-spin text-4xl mb-2">⚡</div>
              <p className="text-foreground font-semibold">{mintStatus}</p>
              {txHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 block"
                >
                  View on BaseScan
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 flex-wrap justify-center">
        {!gameStarted || gameOver ? (
          <button
            onClick={startGame}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            {gameOver ? "🔄 Play Again" : "▶️ Start Game"}
          </button>
        ) : null}
        <button
          onClick={() => onShare(score)}
          className="px-8 py-4 rounded-full bg-gradient-to-r from-accent to-primary text-accent-foreground text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg"
        >
          📤 Share on Farcaster
        </button>
      </div>

      <div className="flex justify-center p-4 bg-muted/30 backdrop-blur-sm rounded-2xl">
        <button
          onClick={handleJump}
          className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-4xl transition-all duration-200 active:scale-90 shadow-md hover:shadow-lg flex items-center justify-center"
        >
          🦘
        </button>
      </div>
    </section>
  )
}
