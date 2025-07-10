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
        
        let data;
        try {
            const responseText = await response.text();
            data = JSON.parse(responseText);
        } catch {
            // If proxy returns HTML or other format, try parsing as JSON
            data = await response.json();
        }
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