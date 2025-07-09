export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
                'Referer': 'https://cfb.fan/prices/'
            }
        });

        if (!response.ok) {
            throw new Error(`CFB.fan blocked: ${response.status}`);
        }

        const data = await response.json();
        const trainingItems = data?.data?.trainingGuide || [];
        
        res.json({
            success: true,
            items: trainingItems,
            trainingGuide: trainingItems,
            source: 'cfb.fan-vercel',
            platform: cfbPlatform,
            count: trainingItems.length
        });

    } catch (error) {
        res.status(503).json({ 
            success: false,
            error: 'CFB.fan data temporarily unavailable',
            details: error.message
        });
    }
}