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
        
        const targetUrl = `https://cfb.fan/api/cutdb/prices/dashboard/${cfbPlatform}/`;
        
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.google.com/',
                'X-Forwarded-For': '66.249.66.1'
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
            source: 'cfb.fan-proxy',
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