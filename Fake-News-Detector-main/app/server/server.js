const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3001', // Allow requests from this origin
    methods: ['GET', 'POST'], // Allowed methods
    credentials: true, // Allow credentials (optional)
}));
const DEFAULT_PORT = 3083;

app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: 'Server is up and running!' });
});

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required." });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([userMessage]);

        // Adjust this line based on the actual response structure
        res.json({ reply: result.text || result.response.text() });

    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ reply: "Sorry, something went wrong." });
    }
});

// Find available port
const findAvailablePort = async (port) => {
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            resolve(port);
            server.close(); 
        });

        server.on('error', () => {
            resolve(findAvailablePort(port + 1)); 
        });
    });
};

// Start server
findAvailablePort(DEFAULT_PORT).then((port) => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        // Check API status when server starts
        console.log('Checking API status...');
        fetch(`http://localhost:${port}/api/status`)
            .then((response) => {
                if (response.ok) {
                    console.log('API is up and running!');
                } else {
                    console.error(`API returned status: ${response.status}`);
                }
            })
            .catch((error) => {
                console.error('Error checking API status:', error);
            });
    });
});
