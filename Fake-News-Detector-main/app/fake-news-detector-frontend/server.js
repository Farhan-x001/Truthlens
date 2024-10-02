const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const DEFAULT_PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    });
});
