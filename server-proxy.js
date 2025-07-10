import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
    origin: [
        "https://coinbible.gg",
        "https://www.coinbible.gg",
        "https://api.coinbible.gg",
        "https://coinbible-membership.web.app",
        "https://coinbible-membership.firebaseapp.com",
        /.*\.web\.app$/,
        /.*\.firebaseapp\.com$/,
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5500",
        "http://127.0.0.1:3001"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Accept-Language", "Cache-Control", "Pragma", "User-Agent"],
    credentials: true
}));

app.use(express.json());

// Proxy function with multiple fallbacks
async function fetchCFBData(cfbPlatform) {
    const targetUrl = `https://cfb.fan/api/cutdb/prices/dashboard/${cfbPlatform}/`;
    const proxies = [
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        `https://cors-anywhere.herokuapp.com/${targetUrl}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
    ];
    
    for (const proxyUrl of proxies) {
        try {
            const response = await fetch(proxyUrl, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Handle different proxy response formats
                if (data.contents) {
                    return JSON.parse(data.contents);
                } else if (typeof data === 'string') {
                    return JSON.parse(data);
                } else {
                    return data;
                }
            }
        } catch (error) {
            console.log(`Proxy failed: ${proxyUrl}`);
            continue;
        }
    }
    
    throw new Error('All proxies failed');
}

// Training items endpoint
app.get('/api/training-items', async (req, res) => {
    try {
        const platform = req.query.platform || 'xbox';
        const cfbPlatform = platform === 'playstation' ? 'playstation-5' : 'xbox-series-x';
        
        const data = await fetchCFBData(cfbPlatform);
        const trainingItems = data?.data?.trainingGuide || [];
        
        res.json({
            success: true,
            items: trainingItems,
            trainingGuide: trainingItems,
            source: 'cfb.fan-proxy',
            platform: cfbPlatform,
            count: trainingItems.length
        });

    } catch (error) {
        res.status(503).json({ 
            success: false,
            error: 'CFB.fan data temporarily unavailable',
            details: error.message,
            source: 'cfb.fan-proxy-blocked'
        });
    }
});

// Training price endpoint
app.get('/api/training-price', async (req, res) => {
    try {
        const platform = req.query.platform || 'xbox';
        const cfbPlatform = platform === 'playstation' ? 'playstation-5' : 'xbox-series-x';
        
        const data = await fetchCFBData(cfbPlatform);
        const trainingItems = data?.data?.trainingGuide || [];
        
        if (trainingItems.length > 0) {
            const bestItem = trainingItems[0];
            res.json({
                price: bestItem.trainingRatio || 0.12,
                efficiency: bestItem.trainingRatio || 0.12,
                source: 'cfb.fan-proxy',
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
            details: error.message,
            source: 'cfb.fan-proxy-blocked'
        });
    }
});

// Historical prices endpoint (placeholder)
app.get('/api/historical-prices', async (req, res) => {
    res.json({
        prices: [],
        source: 'placeholder'
    });
});

// Health check
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'CFB Proxy Scraper Service',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'CoinBible CFB Proxy Scraper Service',
        endpoints: [
            'GET /api/training-items',
            'GET /api/training-price',
            'GET /api/historical-prices',
            'GET /api/test'
        ]
    });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀 CFB Proxy Scraper Service running on port ${PORT}`);
});