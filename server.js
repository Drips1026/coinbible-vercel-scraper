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
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// Direct CFB.fan training data endpoint
app.get('/api/cfb-training-direct', async (req, res) => {
    try {
        const platform = req.query.platform || 'xbox';
        const cfbPlatform = platform === 'playstation' ? 'playstation-5' : 'xbox-series-x';
        
        console.log(`🎮 Fetching CFB.fan data for ${cfbPlatform}...`);
        
        const response = await fetch(`https://cfb.fan/api/cutdb/prices/dashboard/${cfbPlatform}/`, {
            headers: {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'dnt': '1',
                'prefer': 'safe',
                'priority': 'u=1, i',
                'referer': 'https://cfb.fan/prices/',
                'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
            }
        });

        if (!response.ok) {
            throw new Error(`CFB.fan API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ CFB.fan data received:', data?.data?.trainingGuide?.length || 0, 'items');

        const trainingItems = data?.data?.trainingGuide || [];
        
        res.json({
            success: true,
            items: trainingItems,
            trainingGuide: trainingItems,
            source: 'cfb.fan-direct',
            platform: cfbPlatform,
            count: trainingItems.length
        });

    } catch (error) {
        console.error('❌ CFB.fan direct fetch error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            source: 'cfb.fan-direct'
        });
    }
});

// Legacy training-items endpoint (redirects to CFB direct)
app.get('/api/training-items', async (req, res) => {
    try {
        const platform = req.query.platform || 'xbox';
        const cfbPlatform = platform === 'playstation' ? 'playstation-5' : 'xbox-series-x';
        
        const response = await fetch(`https://cfb.fan/api/cutdb/prices/dashboard/${cfbPlatform}/`, {
            headers: {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const data = await response.json();
        const trainingItems = data?.data?.trainingGuide || [];
        
        res.json({
            success: true,
            items: trainingItems,
            trainingGuide: trainingItems,
            source: 'cfb.fan-legacy',
            platform: cfbPlatform,
            count: trainingItems.length
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Training price endpoint
app.get('/api/training-price', async (req, res) => {
    try {
        const platform = req.query.platform || 'xbox';
        const cfbPlatform = platform === 'playstation' ? 'playstation-5' : 'xbox-series-x';
        
        const response = await fetch(`https://cfb.fan/api/cutdb/prices/dashboard/${cfbPlatform}/`);
        const data = await response.json();
        const trainingItems = data?.data?.trainingGuide || [];
        
        if (trainingItems.length > 0) {
            const bestItem = trainingItems[0];
            res.json({
                price: bestItem.trainingRatio || 0.12,
                efficiency: bestItem.trainingRatio || 0.12,
                source: 'cfb.fan',
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
        res.status(500).json({ error: error.message });
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
        service: 'CFB Scraper Service',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'CoinBible CFB Scraper Service',
        endpoints: [
            'GET /api/cfb-training-direct',
            'GET /api/training-items',
            'GET /api/training-price',
            'GET /api/historical-prices',
            'GET /api/test'
        ]
    });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀 CFB Scraper Service running on port ${PORT}`);
});