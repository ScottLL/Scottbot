var widget = document.getElementById("widget");
var chatContainer = document.getElementById("chat-container");
var chatHeader = document.getElementById("chat-header");
var inputField = document.getElementById("user-message");
var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

function openChat() {
  widget.style.display = "none";
  chatContainer.style.display = "block";
}

function minimizeChat() {
  chatContainer.style.display = "none";
  widget.style.display = "block";
}

chatHeader.addEventListener("mousedown", dragMouseDown);

function dragMouseDown(e) {
  e = e || window.event;
  e.preventDefault();
  pos3 = e.clientX;
  pos4 = e.clientY;
  document.addEventListener("mouseup", closeDragElement);
  document.addEventListener("mousemove", elementDrag);
}

function elementDrag(e) {
  e = e || window.event;
  e.preventDefault();
  pos1 = pos3 - e.clientX;
  pos2 = pos4 - e.clientY;
  pos3 = e.clientX;
  pos4 = e.clientY;
  chatContainer.style.top = (chatContainer.offsetTop - pos2) * 0.07320644216691069 + "vw";
  chatContainer.style.left = (chatContainer.offsetLeft - pos1) * 0.07320644216691069 + "px";
}

function closeDragElement() {
  document.removeEventListener("mouseup", closeDragElement);
  document.removeEventListener("mousemove", elementDrag);
}

document.addEventListener("DOMContentLoaded", function() {
  var chatHistory = document.getElementById("chat-history");
  var introductionElement = document.createElement("li");
  var messageContainer = document.createElement("div");
  messageContainer.className = "message";

  var profileContainer = document.createElement("div");
  profileContainer.className = "profile";

  var profileImage = document.createElement("img");
  profileImage.width = 30;
  profileImage.height = 30;
  profileImage.style.borderRadius = "50%";
  profileImage.src = "/static/pic/Scott.jpg";

  var nameElement = document.createElement("div");
  nameElement.className = "name";
  nameElement.textContent = "Scott"; /* Scott's name */

  profileContainer.appendChild(profileImage);
  profileContainer.appendChild(nameElement); /* Append the name element to the profile container */

  var messageText = document.createElement("span");
  messageText.className = "bubble";
  messageText.textContent = "Hello there, I'm Scott's AI Avatar, your can ask me anything related with Scott's background, skills, and experiences. How can I help you?";

  messageContainer.appendChild(profileContainer); /* Append the profile container to the message container */
  messageContainer.appendChild(messageText);
  introductionElement.appendChild(messageContainer);
  chatHistory.appendChild(introductionElement);
});

document.getElementById("chat-form").addEventListener("submit", function(event) {
  event.preventDefault();
  sendMessage();
});

document.getElementById("send-button").addEventListener("click", function(event) {
  event.preventDefault();
  sendMessage();
});

function sendMessage() {
  var userMessage = document.getElementById("user-message").value;

  if (userMessage.trim() === "") {
    return;
  }

  var chatHistory = document.getElementById("chat-history");
  var userMessageElement = document.createElement("li");
  var userMessageContainer = document.createElement("div");
  userMessageContainer.className = "message user";
  var userMessageText = document.createElement("span");
  userMessageText.className = "bubble";
  userMessageText.textContent = userMessage;
  userMessageContainer.appendChild(userMessageText);
  userMessageElement.appendChild(userMessageContainer);
  chatHistory.appendChild(userMessageElement);

  document.getElementById("user-message").value = ""; // Clear the text input field
  document.getElementById("user-message").style.height = "auto"; // Reset the textarea height
  adjustTextAreaHeight(); // Adjust textarea height after sending message

  var thinkingElement = document.createElement("li");
  thinkingElement.textContent = "Scott is typing...";
  thinkingElement.classList.add("thinking-message");
  chatHistory.appendChild(thinkingElement);

  // Scroll to the bottom of the chat history
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Replace the URL with your actual endpoint for processing user messages
  // fetch("http://localhost:8000/ask/", {
    // fetch("http://0.0.0.0:8000/ask/", {
      fetch("http://scottavatar.azurewebsites.net/ask/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question: userMessage })
    })
      .then(response => response.json())
      .then(data => {
        chatHistory.removeChild(thinkingElement);
  
        var adaMessage = data.chat_history[data.chat_history.length - 1];
  
        var messageElement = document.createElement("li");
        var messageContainer = document.createElement("div");
        messageContainer.className = "message";
  
        var profileContainer = document.createElement("div");
        profileContainer.className = "profile";
  
        var profileImage = document.createElement("img");
        profileImage.width = 30;
        profileImage.height = 30;
        profileImage.style.borderRadius = "50%";
        profileImage.src = "./static/pic/Scott.jpg";
  
        var nameElement = document.createElement("div");
        nameElement.className = "name";
        nameElement.textContent = "Scott"; /* Scott's name */
  
        profileContainer.appendChild(profileImage);
        profileContainer.appendChild(nameElement); /* Append the name element to the profile container */
  
        var messageText = document.createElement("span");
        messageText.className = "bubble";
  
        // Split each bullet point into a new line
        var content = adaMessage.content.split('\n').map(line => {
          return document.createTextNode(line);
        });
  
        // Append each line as a separate child node to messageText
        content.forEach((line, index) => {
          if (index > 0) {
            messageText.appendChild(document.createElement("br"));
          }
          messageText.appendChild(line);
        });
  
        messageContainer.appendChild(profileContainer); /* Append the profile container to the message container */
        messageContainer.appendChild(messageText);
        messageElement.appendChild(messageContainer);
        chatHistory.appendChild(messageElement);
  
        // Scroll to the bottom of the chat history
        chatHistory.scrollTop = chatHistory.scrollHeight;
  
      });
  }
  


function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function adjustTextAreaHeight() {
  var textarea = document.getElementById("user-message");
  textarea.style.height = "auto"; // Reset the height
  textarea.style.height = textarea.scrollHeight + "px"; // Set the height to fit the content
}

