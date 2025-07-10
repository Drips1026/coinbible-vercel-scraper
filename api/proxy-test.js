export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Try ScrapingBee service (requires API key)
        const targetUrl = 'https://cfb.fan/api/cutdb/prices/dashboard/xbox-series-x/';
        const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=YOUR_API_KEY&url=${encodeURIComponent(targetUrl)}&render_js=false`;
        
        const response = await fetch(scrapingBeeUrl);
        
        if (response.ok) {
            const data = await response.json();
            res.json({
                success: true,
                message: 'ScrapingBee test successful',
                data: data
            });
        } else {
            throw new Error(`ScrapingBee failed: ${response.status}`);
        }
        
    } catch (error) {
        res.status(503).json({
            success: false,
            error: 'Proxy test failed',
            details: error.message,
            suggestion: 'CFB.fan has comprehensive blocking. Consider: 1) Wait for block to expire, 2) Use VPN, 3) Deploy from different cloud provider, 4) Contact CFB.fan for API access'
        });
    }
}