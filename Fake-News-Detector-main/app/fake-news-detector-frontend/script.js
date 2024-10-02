document.getElementById('send-button').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;

   // Check if input is empty
   if (!userInput) return;

   // Add user's message to chat window
   addMessage(userInput, 'user');

   // Fetch response from the server
   const response = await fetch('/api/chat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ message: userInput })
   });

   // Parse the JSON response
   const data = await response.json();

   // Add bot's reply with appropriate class
   addMessage(data.reply, 'bot');

   // Clear the input field
   document.getElementById('user-input').value = '';
});

// Function to add message to chat window
function addMessage(message, sender) {
   const chatWindow = document.getElementById('chat-window');
   const messageDiv = document.createElement('div');

   // Add classes for styling based on sender
   messageDiv.classList.add('chat-message', sender === 'user' ? 'user-message' : 'bot-message');
   messageDiv.textContent = message;

   chatWindow.appendChild(messageDiv);
   
   // Auto-scroll to the bottom of the chat window
   chatWindow.scrollTop = chatWindow.scrollHeight; 
}