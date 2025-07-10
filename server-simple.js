import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Accept-Language", "Cache-Control", "Pragma", "User-Agent"],
    credentials: false
}));

// Simple static data endpoint for testing
app.get('/api/training-items', (req, res) => {
    const mockData = [
        { ovr: 78, training: 350, price: 39, trainingRatio: 0.11 },
        { ovr: 79, training: 400, price: 50, trainingRatio: 0.125 },
        { ovr: 80, training: 450, price: 63, trainingRatio: 0.14 },
        { ovr: 81, training: 500, price: 75, trainingRatio: 0.15 },
        { ovr: 82, training: 550, price: 88, trainingRatio: 0.16 }
    ];
    
    res.json({
        success: true,
        items: mockData,
        source: 'mock-data',
        count: mockData.length
    });
});

app.get('/api/training-price', (req, res) => {
    res.json({
        price: 0.12,
        efficiency: 0.12,
        source: 'mock',
        platform: 'xbox'
    });
});

app.get('/api/test', (req, res) => {
    res.json({ status: 'OK', service: 'Simple Mock Service' });
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`🚀 Simple Mock Service running on port ${PORT}`);
});