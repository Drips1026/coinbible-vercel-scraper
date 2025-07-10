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
        
        // Try proxy service first
        const targetUrl = `https://cfb.fan/api/cutdb/prices/dashboard/${cfbPlatform}/`;
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`CFB API error: ${response.status}`);
        }
        
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        const trainingItems = data?.data?.trainingGuide || [];
        
        res.json({
            success: true,
            items: trainingItems,
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