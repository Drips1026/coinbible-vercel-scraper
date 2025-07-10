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
        
        const response = await fetch(`https://cfb.fan/api/cutdb/prices/dashboard/${cfbPlatform}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://cfb.fan/'
            }
        });
        
        if (!response.ok) {
            throw new Error(`CFB API error: ${response.status}`);
        }
        
        const data = await response.json();
        const trainingItems = data?.data?.trainingGuide || [];
        
        if (trainingItems.length > 0) {
            const bestItem = trainingItems[0];
            res.json({
                price: bestItem.trainingRatio || 0.12,
                efficiency: bestItem.trainingRatio || 0.12,
                source: 'cfb.fan-vercel',
                platform: cfbPlatform,
                bestItem: bestItem
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