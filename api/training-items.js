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
        const proxies = [
            `https://cors-anywhere.herokuapp.com/${targetUrl}`,
            `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
            `https://thingproxy.freeboard.io/fetch/${targetUrl}`
        ];
        
        let trainingItems = [];
        let lastError = null;
        
        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.ok) {
                    let data;
                    const responseText = await response.text();
                    
                    // Handle different proxy response formats
                    if (proxyUrl.includes('allorigins')) {
                        const proxyData = JSON.parse(responseText);
                        data = JSON.parse(proxyData.contents);
                    } else {
                        data = JSON.parse(responseText);
                    }
                    
                    trainingItems = data?.data?.trainingGuide || [];
                    if (trainingItems.length > 0) {
                        break; // Success, exit loop
                    }
                }
            } catch (error) {
                lastError = error;
                continue; // Try next proxy
            }
        }
        
        if (trainingItems.length === 0) {
            throw new Error(`All proxies failed. Last error: ${lastError?.message || 'Unknown'}`);
        }
        
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