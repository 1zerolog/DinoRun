// Base Mini App Configuration
const ROOT_URL = process.env.NEXT_PUBLIC_URL || "https://dino-run-mini-6vig3fowx-zerologs-projects.vercel.app";

export const minikitConfig = {
  accountAssociation: { // this will be added in step 5
    "header": "",
    "payload": "",
    "signature": ""
  },
  miniapp: {
    version: "1",
    name: "DinoRun", 
    subtitle: "Endless Runner Game", 
    description: "Play DinoRun - an exciting endless runner game where you control a dinosaur jumping over obstacles. Try to get the highest score and share it with friends on Farcaster!",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/snake-icon.png`,
    splashImageUrl: `${ROOT_URL}/snake-hero.png`,
    splashBackgroundColor: "#667eea",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["game", "dino", "runner", "endless", "arcade", "fun"],
    heroImageUrl: `${ROOT_URL}/snake-hero.png`, 
    tagline: "Jump, boost, and survive in this thrilling endless runner!",
    ogTitle: "DinoRun - Endless Runner Game on Farcaster",
    ogDescription: "Play DinoRun - an exciting endless runner game where you control a dinosaur jumping over obstacles. Try to get the highest score!",
    ogImageUrl: `${ROOT_URL}/snake-hero.png`,
  },
} as const;
