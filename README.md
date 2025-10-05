# 🦕 DinoRun - Farcaster Mini App

A fun and engaging DinoRun game built as a Farcaster mini app with frame integration. Control a dinosaur, avoid obstacles, and try to beat your high score!

## 🎮 Game Features

- **Classic DinoRun Gameplay**: Jump over cacti obstacles to survive
- **Progressive Difficulty**: Game speed increases as you progress
- **High Score Tracking**: Local storage saves your best score
- **Responsive Design**: Works on desktop and mobile devices
- **Farcaster Frame Integration**: Shareable as a Farcaster frame
- **Touch & Keyboard Controls**: Multiple input methods supported

## 🚀 Quick Start

### Option 1: Local Development
```bash
# Clone or download the project
cd DinoRun

# Install dependencies (optional)
npm install

# Start local server
npm run dev
# or
npx serve . -l 3000
```

### Option 2: Direct File Opening
Simply open `index.html` in your web browser to play the game immediately.

## 🎯 How to Play

1. **Start the Game**: Click anywhere or press SPACE to begin
2. **Jump**: Press SPACE, click the JUMP button, or tap the screen
3. **Avoid Obstacles**: Jump over cacti to survive
4. **Score Points**: Each frame survived increases your score
5. **Beat Your High Score**: Try to achieve the highest score possible!

## 🛠️ Technical Details

### File Structure
```
DinoRun/
├── index.html          # Main game page with Farcaster frame meta tags
├── styles.css          # Game styling and responsive design
├── game.js            # Core game logic and mechanics
├── api/
│   └── frame.js       # Farcaster frame API endpoint
├── package.json       # Project configuration
└── README.md          # This file
```

### Game Mechanics
- **Physics**: Gravity-based jumping system
- **Collision Detection**: Precise rectangle-based collision detection
- **Progressive Difficulty**: Speed increases every 1000 points
- **Obstacle Generation**: Randomly timed cactus obstacles
- **Score System**: Points awarded for survival time

### Farcaster Integration
- **Frame Meta Tags**: Properly configured for Farcaster frames
- **API Endpoint**: `/api/frame.js` handles frame interactions
- **Shareable**: Can be embedded and shared in Farcaster casts

## 🌐 Deployment

### Static Hosting (Recommended)
Deploy to any static hosting service:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop the folder
- **GitHub Pages**: Push to a repository and enable Pages
- **IPFS**: Upload files to IPFS for decentralized hosting

### Environment Variables
For production deployment, set these environment variables:
```bash
BASE_URL=https://your-domain.com
```

## 🎨 Customization

### Game Settings
Modify these values in `game.js`:
```javascript
this.gameSpeed = 2;           // Initial game speed
this.gravity = 0.6;           // Gravity strength
this.jumpPower = -15;         // Jump force
this.obstacleInterval = 120;  // Frames between obstacles
```

### Styling
Customize colors and appearance in `styles.css`:
- Change the gradient background
- Modify button colors and animations
- Adjust responsive breakpoints

## 📱 Mobile Support

The game is fully responsive and includes:
- Touch controls for mobile devices
- Responsive canvas sizing
- Mobile-optimized UI elements
- Touch-friendly button sizes

## 🔧 Development

### Adding New Features
1. **New Obstacles**: Add new obstacle types in `createObstacle()`
2. **Power-ups**: Implement power-up system in game loop
3. **Animations**: Add sprite animations using canvas drawing
4. **Sound Effects**: Integrate Web Audio API for game sounds

### Performance Optimization
- Uses `requestAnimationFrame` for smooth 60fps gameplay
- Efficient collision detection with early returns
- Minimal DOM manipulation for better performance

## 📄 License

MIT License - feel free to use, modify, and distribute!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Bug Reports

If you encounter any issues:
1. Check the browser console for errors
2. Ensure you're using a modern browser
3. Try refreshing the page
4. Report issues with browser and device information

## 🎉 Enjoy Playing!

Have fun playing DinoRun! Try to beat your high score and share your achievements on Farcaster!

---

*Built with ❤️ for the Farcaster community*