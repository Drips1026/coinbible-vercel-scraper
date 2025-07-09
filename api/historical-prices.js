export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Return empty historical data for now
    res.json({
        prices: [],
        timeRange: req.query.timeRange || '24HRS',
        platform: req.query.platform || 'xbox',
        count: 0,
        source: 'placeholder'
    });
}