document.getElementById('send-btn').addEventListener('click', async function () {
    const message = document.getElementById('chat-input').value;
  
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  
    const data = await response.json();
    document.getElementById('chat-output').innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    document.getElementById('chat-output').innerHTML += `<p><strong>GeminiBot:</strong> ${data.reply}</p>`;
  });
  