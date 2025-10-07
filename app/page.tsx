'use client'

import { useEffect, useState } from 'react'

export default function Page() {
  const [isConnected, setIsConnected] = useState(false)
  const [playerAddress, setPlayerAddress] = useState<string>("")

  useEffect(() => {
    // Check if we're in Farcaster
    const isFarcaster = window.location.hostname.includes('warpcast.com') || 
                       window.location.hostname.includes('farcaster.xyz') ||
                       window.location.hostname.includes('vercel.app')
    
    if (isFarcaster) {
      setIsConnected(true)
      // In a real app, you'd get the actual user address from Farcaster
      setPlayerAddress("0x1234...5678")
    }

    // Load game.js
    const loadGame = async () => {
      try {
        const response = await fetch('/game.js')
        const gameCode = await response.text()
        
        // Create a script element and execute the game code
        const script = document.createElement('script')
        script.textContent = gameCode
        document.head.appendChild(script)
      } catch (error) {
        console.error('Failed to load game.js:', error)
      }
    }

    loadGame()
  }, [])

  const handleShare = (score: number) => {
    const text = `I just scored ${score} points in DinoRun! 🦕 Can you beat my score?`
    const url = window.location.href

    if (navigator.share) {
      navigator.share({
        title: "DinoRun Score",
        text: text,
        url: url,
      }).catch((err) => console.log("Error sharing:", err))
    } else {
      const shareText = `${text}\n${url}`
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Score copied to clipboard! Share it on Farcaster!")
      }).catch((err) => {
        console.log("Error copying to clipboard:", err)
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-4xl w-full shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-4">🦕 DinoRun</h1>
          <p className="text-white/80 text-lg">Fast and Retro dino runner in Farcaster</p>
          {playerAddress && (
            <p className="text-white/60 text-sm mt-2">
              Player: {playerAddress.slice(0, 6)}...{playerAddress.slice(-4)}
            </p>
          )}
        </div>

        {/* Game Container */}
        <div className="bg-black/20 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-white/70 text-sm">Score</div>
                <div className="text-white text-2xl font-bold" id="score">0</div>
              </div>
              <div className="text-center">
                <div className="text-white/70 text-sm">Best</div>
                <div className="text-yellow-400 text-2xl font-bold" id="highScore">0</div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex justify-center">
            <canvas 
              id="gameCanvas" 
              className="border-2 border-white/30 rounded-lg bg-gradient-to-b from-blue-300 to-green-300"
              style={{ maxWidth: '100%', height: 'auto' }}
            ></canvas>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <button 
              id="jumpBtn"
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              🦘 Jump
            </button>
            <button 
              id="restartBtn"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              🔄 Restart
            </button>
            <button 
              id="shareBtn"
              onClick={() => handleShare(0)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              📤 Share
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center mt-6 text-white/80">
            <p className="text-sm">
              <strong>Controls:</strong> Space/↑ Jump • → Nitro Boost • Click/Touch to play
            </p>
            <p className="text-xs mt-2 text-white/60">
              Swipe right on mobile for nitro boost!
            </p>
          </div>
        </div>

        {/* Game Over Modal */}
        <div 
          id="gameOver" 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 hidden"
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
            <div className="text-center">
              <h2 className="text-4xl font-black text-gray-800 mb-4">Game Over!</h2>
              <div className="text-6xl mb-4">🦕💥</div>
              <p className="text-2xl text-gray-600 mb-6">
                Final Score: <span id="finalScore" className="font-bold text-blue-600">0</span>
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  id="restartBtnModal"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  🔄 Play Again
                </button>
                <button 
                  id="shareBtnModal"
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  📤 Share Score
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            Built for Farcaster • Jump over obstacles, share your score, start the competition!
          </p>
        </div>
      </div>

    </div>
  )
}