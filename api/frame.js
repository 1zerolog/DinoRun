// Farcaster Frame API endpoint
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
                image: `${process.env.BASE_URL}/dino-game-preview.png`,
                buttons: [
                    {
                        label: '🎮 Play Now',
                        action: 'link',
                        target: `${process.env.BASE_URL}/index.html`
                    },
                    {
                        label: '📊 Leaderboard',
                        action: 'post'
                    }
                ],
                postUrl: `${process.env.BASE_URL}/api/frame`
            });
            
        case 2: // Leaderboard button
            return res.status(200).json({
                type: 'frame',
                image: `${process.env.BASE_URL}/leaderboard-preview.png`,
                buttons: [
                    {
                        label: '🔄 Back to Game',
                        action: 'post'
                    }
                ],
                postUrl: `${process.env.BASE_URL}/api/frame`
            });
            
        default:
            return res.status(200).json({
                type: 'frame',
                image: `${process.env.BASE_URL}/dino-preview.png`,
                buttons: [
                    {
                        label: 'Play DinoRun',
                        action: 'post'
                    }
                ],
                postUrl: `${process.env.BASE_URL}/api/frame`
            });
    }
}

// Alternative Express.js implementation
export function expressHandler(req, res) {
    const { untrustedData } = req.body;
    
    if (!untrustrustedData) {
        return res.status(400).json({ error: 'Invalid frame data' });
    }

    const { buttonIndex, fid } = untrustedData;
    
    // Store user interaction (optional)
    if (fid) {
        // You could store user interactions in a database here
        console.log(`User ${fid} interacted with button ${buttonIndex}`);
    }
    
    // Return frame response
    const response = {
        type: 'frame',
        image: `${process.env.BASE_URL || 'https://your-domain.com'}/dino-game-preview.png`,
        buttons: [
            {
                label: '🎮 Play DinoRun',
                action: 'link',
                target: `${process.env.BASE_URL || 'https://your-domain.com'}/index.html`
            },
            {
                label: '🔄 Share Score',
                action: 'post'
            }
        ],
        postUrl: `${process.env.BASE_URL || 'https://your-domain.com'}/api/frame`
    };
    
    res.status(200).json(response);
}
