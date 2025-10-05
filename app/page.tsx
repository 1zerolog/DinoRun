"use client"

import { useEffect, useRef, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import { getWalletClient, getPublicClient, switchToBaseNetwork } from "@/lib/web3"
import { SNAKE_NFT_CONTRACT } from "@/lib/contract"

type Point = { x: number; y: number }
type Dir = "up" | "down" | "left" | "right"

const GRID = 18
const CELL = 22
const INITIAL_SPEED = 150

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
      const shareText = `Just scored ${score} points in Snake Game! Can you beat my score?`
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
          <div className="text-8xl animate-pulse">🐍</div>
          <p className="text-xl mt-5 text-foreground/80">Loading Snake Game...</p>
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
      <div className="text-8xl animate-bounce">🐍</div>
      <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
        Snake Game
      </h1>
      <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-lg">
        Classic snake game with modern graphics. Connect your wallet to start playing and mint your high scores as NFTs!
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
          <span>D-Pad</span>
        </div>
      </div>
    </section>
  )
}

function Game({ onShare, playerAddress }: { onShare: (score: number) => void; playerAddress?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ])
  const [food, setFood] = useState<Point>({ x: 15, y: 10 })
  const [dir, setDir] = useState<Dir>("right")
  const dirRef = useRef<Dir>("right")
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showNFTPrompt, setShowNFTPrompt] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintStatus, setMintStatus] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")

  useEffect(() => {
    dirRef.current = dir
  }, [dir])

  const generateFood = () => {
    let newFood: Point
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      }
    } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y))
    return newFood
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return
      const key = e.key
      setDir((prev) => {
        if ((key === "ArrowUp" || key === "w") && prev !== "down") return "up"
        if ((key === "ArrowDown" || key === "s") && prev !== "up") return "down"
        if ((key === "ArrowLeft" || key === "a") && prev !== "right") return "left"
        if ((key === "ArrowRight" || key === "d") && prev !== "left") return "right"
        return prev
      })
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [gameStarted, gameOver])

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

      if (Math.abs(dx) > Math.abs(dy)) {
        setDir((prev) => {
          if (dx > 30 && prev !== "left") return "right"
          if (dx < -30 && prev !== "right") return "left"
          return prev
        })
      } else {
        setDir((prev) => {
          if (dy > 30 && prev !== "up") return "down"
          if (dy < -30 && prev !== "down") return "up"
          return prev
        })
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
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] }
        const currentDir = dirRef.current

        if (currentDir === "up") head.y -= 1
        if (currentDir === "down") head.y += 1
        if (currentDir === "left") head.x -= 1
        if (currentDir === "right") head.x += 1

        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
          setGameOver(true)
          if (score >= 30) {
            setShowNFTPrompt(true)
          }
          if (score > highScore) setHighScore(score)
          return prevSnake
        }

        if (prevSnake.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true)
          if (score >= 30) {
            setShowNFTPrompt(true)
          }
          if (score > highScore) setHighScore(score)
          return prevSnake
        }

        const newSnake = [head, ...prevSnake]

        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 10)
          setFood(generateFood())
          setSpeed((s) => Math.max(50, s - 5))
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, speed)

    return () => clearInterval(interval)
  }, [gameStarted, gameOver, food, speed, score, highScore])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    bgGradient.addColorStop(0, "#1a1a2e")
    bgGradient.addColorStop(1, "#16213e")
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL, 0)
      ctx.lineTo(i * CELL, GRID * CELL)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL)
      ctx.lineTo(GRID * CELL, i * CELL)
      ctx.stroke()
    }

    const time = Date.now() / 200
    const pulse = Math.sin(time) * 3 + 3
    const foodX = food.x * CELL + CELL / 2
    const foodY = food.y * CELL + CELL / 2

    const foodGlow = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, CELL / 2 + pulse)
    foodGlow.addColorStop(0, "rgba(255, 107, 107, 1)")
    foodGlow.addColorStop(0.5, "rgba(255, 107, 107, 0.5)")
    foodGlow.addColorStop(1, "rgba(255, 107, 107, 0)")
    ctx.fillStyle = foodGlow
    ctx.beginPath()
    ctx.arc(foodX, foodY, CELL / 2 + pulse, 0, Math.PI * 2)
    ctx.fill()

    const foodGradient = ctx.createRadialGradient(foodX - 3, foodY - 3, 0, foodX, foodY, CELL / 2)
    foodGradient.addColorStop(0, "#ff6b6b")
    foodGradient.addColorStop(1, "#ee5a6f")
    ctx.fillStyle = foodGradient
    ctx.beginPath()
    ctx.arc(foodX, foodY, CELL / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    snake.forEach((segment, index) => {
      const x = segment.x * CELL
      const y = segment.y * CELL
      const isHead = index === 0

      if (isHead) {
        const headGrad = ctx.createLinearGradient(x, y, x + CELL, y + CELL)
        headGrad.addColorStop(0, "#4facfe")
        headGrad.addColorStop(1, "#00f2fe")
        ctx.fillStyle = headGrad
        ctx.shadowColor = "rgba(79, 172, 254, 0.5)"
        ctx.shadowBlur = 15
        ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4)
        ctx.shadowBlur = 0

        const eyeSize = 3
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.arc(x + CELL * 0.35, y + CELL * 0.35, eyeSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x + CELL * 0.65, y + CELL * 0.35, eyeSize, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "#000"
        ctx.beginPath()
        ctx.arc(x + CELL * 0.35, y + CELL * 0.35, 1.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x + CELL * 0.65, y + CELL * 0.35, 1.5, 0, Math.PI * 2)
        ctx.fill()
      } else {
        const bodyGrad = ctx.createLinearGradient(x, y, x + CELL, y + CELL)
        const alpha = 1 - (index / snake.length) * 0.3
        bodyGrad.addColorStop(0, `rgba(99, 110, 250, ${alpha})`)
        bodyGrad.addColorStop(1, `rgba(139, 92, 246, ${alpha})`)
        ctx.fillStyle = bodyGrad
        ctx.shadowColor = "rgba(99, 110, 250, 0.3)"
        ctx.shadowBlur = 10
        ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4)
        ctx.shadowBlur = 0
      }
    })
  }, [snake, food])

  const startGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ])
    setFood(generateFood())
    setDir("right")
    dirRef.current = "right"
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setGameOver(false)
    setGameStarted(true)
    setShowNFTPrompt(false)
    setMintStatus("")
    setTxHash("")
  }

  const handleDirChange = (newDir: Dir) => {
    setDir((prev) => {
      if (newDir === "up" && prev !== "down") return newDir
      if (newDir === "down" && prev !== "up") return newDir
      if (newDir === "left" && prev !== "right") return newDir
      if (newDir === "right" && prev !== "left") return newDir
      return prev
    })
  }

  const handleMintNFT = async () => {
    setIsMinting(true)
    setMintStatus("Checking network...")

    console.log("[v0] Starting NFT mint process")
    console.log("[v0] Player address:", playerAddress)
    console.log("[v0] Score:", score)
    console.log("[v0] Contract address:", SNAKE_NFT_CONTRACT.address)

    try {
      if (SNAKE_NFT_CONTRACT.address === "0x0000000000000000000000000000000000000000") {
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
        address: SNAKE_NFT_CONTRACT.address as `0x${string}`,
        abi: SNAKE_NFT_CONTRACT.abi,
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
        <h1 className="text-4xl font-black text-foreground">🐍 Snake</h1>
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
        width={GRID * CELL}
        height={GRID * CELL}
        className="border-4 border-border/30 rounded-2xl shadow-xl max-w-full h-auto aspect-square"
      />

      {!gameStarted && !gameOver && (
        <div className="text-center p-6 bg-muted/50 backdrop-blur-md rounded-2xl">
          <p className="text-lg mb-2 text-foreground">Ready to play?</p>
          <p className="text-sm text-muted-foreground">Use arrow keys, WASD, swipe, or D-pad to move</p>
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

      <div className="grid grid-cols-3 gap-2 p-4 bg-muted/30 backdrop-blur-sm rounded-2xl">
        <div />
        <button
          onClick={() => handleDirChange("up")}
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl transition-all duration-200 active:scale-90 shadow-md hover:shadow-lg"
        >
          ↑
        </button>
        <div />
        <button
          onClick={() => handleDirChange("left")}
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl transition-all duration-200 active:scale-90 shadow-md hover:shadow-lg"
        >
          ←
        </button>
        <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center text-3xl">🎮</div>
        <button
          onClick={() => handleDirChange("right")}
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl transition-all duration-200 active:scale-90 shadow-md hover:shadow-lg"
        >
          →
        </button>
        <div />
        <button
          onClick={() => handleDirChange("down")}
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl transition-all duration-200 active:scale-90 shadow-md hover:shadow-lg"
        >
          ↓
        </button>
        <div />
      </div>
    </section>
  )
}
