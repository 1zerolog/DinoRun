// Farcaster Frame API endpoint for Vercel
// This file handles the frame interactions for the DinoRun game

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { untrustedData } = req.body;
    
    if (!untrustrustedData) {
        return res.status(400).json({ error: 'Invalid frame data' });
    }

    const { buttonIndex, fid, castHash } = untrustedData;
    
    // Handle different button interactions
    switch (buttonIndex) {
        case 1: // Play DinoRun button
            return res.status(200).json({
                type: 'frame',
                image: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://your-domain.vercel.app'}/dino-game-preview.png`,
                buttons: [
                    {
                        label: '🎮 Play Now',
                        action: 'link',
                        target: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://your-domain.vercel.app'}/index.html`
                    },
                    {
                        label: '📊 Leaderboard',
                        action: 'post'
                    }
                ],
                postUrl: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://your-domain.vercel.app'}/api/frame`
            });
            
        case 2: // Leaderboard button
            return res.status(200).json({
                type: 'frame',
                image: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://your-domain.vercel.app'}/leaderboard-preview.png`,
                buttons: [
                    {
                        label: '🔄 Back to Game',
                        action: 'post'
                    }
                ],
                postUrl: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://your-domain.vercel.app'}/api/frame`
            });
            
        default:
            return res.status(200).json({
                type: 'frame',
                image: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://your-domain.vercel.app'}/dino-preview.png`,
                buttons: [
                    {
                        label: 'Play DinoRun',
                        action: 'post'
                    }
                ],
                postUrl: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://your-domain.vercel.app'}/api/frame`
            });
    }
}