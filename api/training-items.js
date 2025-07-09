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
        console.log('Returning cached data');
        return res.json({
            ...cachedData,
            cached: true,
            cacheAge: Math.floor((now - cacheTimestamp) / 1000 / 60) // minutes
        });
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
        
        const responseData = {
            success: true,
            items: trainingItems,
            trainingGuide: trainingItems,
            source: 'cfb.fan-vercel',
            platform: cfbPlatform,
            count: trainingItems.length,
            cached: false,
            fetchedAt: new Date().toISOString()
        };
        
        // Cache the data
        cachedData = responseData;
        cacheTimestamp = now;
        console.log('Data cached for 1 hour');
        
        res.json(responseData);

    } catch (error) {
        res.status(503).json({ 
            success: false,
            error: 'CFB.fan data temporarily unavailable',
            details: error.message
        });
    }
}