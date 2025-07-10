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
        
        // CFB.fan is blocked, return fallback data
        const fallbackItems = [
            { ovr: 78, training: 350, price: 39, trainingRatio: 0.11 },
            { ovr: 79, training: 400, price: 50, trainingRatio: 0.125 },
            { ovr: 80, training: 450, price: 63, trainingRatio: 0.14 },
            { ovr: 81, training: 500, price: 75, trainingRatio: 0.15 },
            { ovr: 82, training: 550, price: 88, trainingRatio: 0.16 }
        ];
        
        const trainingItems = fallbackItems;
        
        res.json({
            success: true,
            items: trainingItems,
            source: 'fallback-data',
            platform: cfbPlatform,
            count: trainingItems.length,
            note: 'CFB.fan blocked - using reference data'
        });
        
    } catch (error) {
        res.status(503).json({
            success: false,
            error: 'CFB.fan data temporarily unavailable',
            details: error.message
        });
    }
}