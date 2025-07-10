export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const platform = req.query.platform || 'xbox';
        const cfbPlatform = platform === 'playstation' ? 'playstation-5' : 'xbox-series-x';
        
        // CFB.fan is blocked, use fallback data
        const trainingItems = [{ trainingRatio: 0.12 }];
        
        if (trainingItems.length > 0) {
            const bestItem = trainingItems[0];
            res.json({
                price: bestItem.trainingRatio || 0.12,
                efficiency: bestItem.trainingRatio || 0.12,
                source: 'fallback-data',
                platform: cfbPlatform,
                bestItem: bestItem,
                note: 'CFB.fan blocked - using reference data'
            });
        } else {
            res.json({
                price: 0.12,
                efficiency: 0.12,
                source: 'fallback',
                platform: cfbPlatform
            });
        }
        
    } catch (error) {
        res.status(503).json({
            error: 'CFB.fan training price temporarily unavailable',
            details: error.message
        });
    }
}