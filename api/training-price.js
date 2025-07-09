// Cache for storing data
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const now = Date.now();
    
    // Return cached data if still valid
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('Returning cached training price');
        return res.json(cachedData);
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
        
        let responseData;
        if (trainingItems.length > 0) {
            const bestItem = trainingItems[0];
            responseData = {
                price: bestItem.trainingRatio || 0.12,
                efficiency: bestItem.trainingRatio || 0.12,
                source: 'cfb.fan-vercel',
                platform: cfbPlatform,
                bestItem: bestItem,
                fetchedAt: new Date().toISOString()
            };
        } else {
            responseData = {
                price: 0.12,
                efficiency: 0.12,
                source: 'fallback',
                platform: cfbPlatform,
                fetchedAt: new Date().toISOString()
            };
        }
        
        // Cache the data
        cachedData = responseData;
        cacheTimestamp = now;
        console.log('Training price cached for 1 hour');
        
        res.json(responseData);
    } catch (error) {
        res.status(503).json({ 
            error: 'CFB.fan training price temporarily unavailable',
            details: error.message
        });
    }
}