// Webhook endpoint for Farcaster Mini App
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, data } = req.body;
    
    // Handle different webhook events
    switch (action) {
      case 'game_start':
        console.log('Game started by user:', data.userId);
        break;
      case 'score_share':
        console.log('Score shared:', data.score, 'by user:', data.userId);
        break;
      case 'game_complete':
        console.log('Game completed with score:', data.score, 'by user:', data.userId);
        break;
      default:
        console.log('Unknown action:', action, 'with data:', data);
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Webhook received successfully' 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
