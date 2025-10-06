# 🦕 DinoRun Mini App

A thrilling endless runner game built as a Farcaster Mini App using Base's MiniKit framework.

## 🎮 Game Features

- **Endless Runner Gameplay**: Control a dinosaur jumping over obstacles
- **Nitro Boost**: Swipe right or press right arrow for speed boost
- **Multiple Obstacles**: Avoid cacti, rocks, cars, and other obstacles
- **Score System**: Track your high score with local storage
- **Social Sharing**: Share your scores on Farcaster
- **Mobile Optimized**: Touch controls for mobile devices

## 🎯 How to Play

- **Jump**: Tap/click or press SPACE to jump over obstacles
- **Nitro Boost**: Swipe right or press RIGHT ARROW for speed boost
- **Avoid**: Don't hit any obstacles or the game ends
- **Score**: Try to get the highest score possible!

## 🚀 Deployment

This Mini App is designed to be deployed on Vercel:

1. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```

2. **Configure Environment Variables**:
   - Set your domain URL in the deployment settings
   - Update all placeholder URLs in the configuration files

3. **Account Association**:
   - Use the [Base Build Account association tool](https://build.base.org/account-association)
   - Follow the steps to associate your Farcaster account

## 📁 Project Structure

```
├── index.html              # Main game interface
├── game.js                 # Game logic and mechanics
├── minikit.config.ts       # MiniKit configuration
├── app/
│   └── .well-known/
│       └── farcaster.json  # Farcaster manifest
├── api/
│   └── webhook.js          # Webhook endpoint
├── public/                 # Static assets
└── vercel.json            # Vercel deployment config
```

## 🔧 Configuration

Update the following files with your actual domain:

1. `minikit.config.ts` - Update `ROOT_URL` and all image URLs
2. `app/.well-known/farcaster.json` - Update all image URLs
3. `index.html` - Update meta tags and image URLs

## 🎨 Customization

- **Game Mechanics**: Modify `game.js` for different gameplay
- **Styling**: Update CSS in `index.html` for visual changes
- **Assets**: Replace placeholder images in the `public/` folder
- **Manifest**: Update `farcaster.json` for different app metadata

## 📱 Farcaster Integration

This Mini App integrates with Farcaster through:
- Manifest file for app discovery
- Webhook endpoints for user interactions
- Social sharing functionality
- Base MiniKit framework

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to production
npm run deploy
```

## 📄 License

MIT License - feel free to use this template for your own Mini Apps!

---

Built with ❤️ for the Farcaster ecosystem using Base MiniKit.
