// src/components/ChatComponent.js

import React, { useState, useEffect } from 'react';
import geminiIcon from '../assets/images/vecteezy_gemini-icon-on-a-transparent-background_46861646.png';

import './ChatComponent.css'; // Adjust the path as needed

const ChatComponent = ({ activeContainer }) => {
    const [userMessage, setUserMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [showBot, setShowBot] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);

    // Check API status on component mount
    useEffect(() => {
        const checkApiStatus = async () => {
            try {
                const response = await fetch('http://localhost:3083/api/chat');
                if (response.ok) {
                    console.log('API is up and running!');
                } else {
                    console.error(`API returned status: ${response.status}`);
                }
            } catch (error) {
                console.error('Error checking API status:', error);
            }
        };

        checkApiStatus(); // Call the function
    }, []); // Empty dependency array means this runs once when the component mounts

    const handleInputChange = (e) => {
        setUserMessage(e.target.value);
    };

    const toggleBot = () => {
        setShowBot((prev) => !prev);
        if (showBot) setChatHistory([]); // Clear chat when closing the bot
    };

    const sendMessage = async () => {
        if (!userMessage) return;
    
        // Add user's message to chat history
        setChatHistory((prev) => [...prev, { sender: 'user', text: userMessage }]);
        setUserMessage(''); // Clear input after sending
    
        setIsBotTyping(true); // Start typing indicator
    
        try {
            const response = await fetch('http://localhost:3083/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });
    
            console.log('Response status:', response.status); // Log the response status
    
            if (!response.ok) {
                const errorText = await response.text(); // Get the error message from response
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
    
            const data = await response.json();
    
            // Check if response contains expected data
            if (data && data.reply) {
                // Split the reply into paragraphs
                const paragraphs = data.reply.split('\n').filter(paragraph => paragraph.trim() !== '');

                // Add bot's replies to chat history as separate messages
                const botMessages = paragraphs.map(text => ({ sender: 'bot', text }));
                setChatHistory((prev) => [...prev, ...botMessages]);
            } else {
                console.error('Unexpected response format:', data);
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setChatHistory((prev) => [
                ...prev,
                { sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' },
            ]);
        } finally {
            setIsBotTyping(false); // Stop typing indicator
        }
    };

    return (
        <div className="geminibot-container">
            <button className="geminibot-button" onClick={toggleBot} style={{ display: 'flex', alignItems: 'center' }}>
    <img src={geminiIcon} alt="Gemini Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
    {/* {showBot ? 'Hide Chatbot' : 'Show Chatbot'} */}
</button>


            {showBot && (
                <div className="chatbot">
                    <div className="chatbot-header">
                    <img src={geminiIcon} alt="Gemini Icon" style={{ width: '40px', height: '40px', marginRight: '8px' }} />
                    <h4>Chatbot</h4>
                        <button onClick={toggleBot}>X</button>
                    </div>
                    <div className="chat-history">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={msg.sender === 'user' ? 'usermessage' : 'bot'}>
                                {/* Render each message with line breaks */}
                                {msg.text.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p> // Each line as a separate paragraph
                                ))}
                            </div>
                        ))}
                        {isBotTyping && <div className="bot typing">Bot is typing...</div>}
                    </div>
                    <input
                        type="text"
                        value={userMessage}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}
        </div>
    );
};

export default ChatComponent;
