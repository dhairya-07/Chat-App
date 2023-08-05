const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("name");
const roomId = urlParams.get("roomId");
const messageInput = document.getElementById("message");

const socket = io("http://localhost:8002");

socket.emit("join-room", { name: username, room: roomId });

socket.on("update-people", (count) => {
  updateNumberOfPeople(count);
});

socket.on("user-joined", (data) => {
  user_joined_left("joined", data.name);
});

socket.on("user-sent-message", (data) => {
  const chatMessages = document.getElementById("chatMessages");

  const newMessage = document.createElement("div");
  newMessage.className = "chat-message left";
  newMessage.innerHTML = `<p>${data.name}: ` + data.message + "</p>";
  chatMessages.appendChild(newMessage);
  scrollToBottom();

  document.getElementById("message").value = "";
  document.getElementById("message").focus();
});

socket.on("left", (data) => {
  user_joined_left("left", data.name);
  updateNumberOfPeople(data.count);
});

messageInput.addEventListener("keyup", onMessageInputKeyUp);
sendBtn.addEventListener("click", onSendButtonClick);

// Sending a message
function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    const chatMessages = document.getElementById("chatMessages");
    const newMessage = document.createElement("div");
    newMessage.className = "chat-message right";
    newMessage.innerHTML = "<p>You: " + message + "</p>";
    chatMessages.appendChild(newMessage);

    scrollToBottom();

    document.getElementById("message").value = "";
    document.getElementById("message").focus();
    socket.emit("user-message", message);
  }
}

function onSendButtonClick() {
  sendMessage();
}

function onMessageInputKeyUp(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

messageInput.addEventListener("keyup", onMessageInputKeyUp);
sendBtn.addEventListener("click", onSendButtonClick);

function user_joined_left(action, name) {
  const chatMessages = document.getElementById("chatMessages");
  const newMessage = document.createElement("div");
  newMessage.className = "chat-message center";
  if (action === "joined") {
    newMessage.innerHTML = `<p> ${name} joined the chat ` + "</p>";
  } else {
    newMessage.innerHTML = `<p> ${name} left the chat ` + "</p>";
  }

  chatMessages.appendChild(newMessage);
  scrollToBottom();
}

let typing = false;
let typingTimeout;

function handleTyping() {
  clearTimeout(typingTimeout);

  if (!typing) {
    socket.emit("user-typing", username);
    typing = true;
  }

  typingTimeout = setTimeout(() => {
    socket.emit("user-stopped-typing", username);
    typing = false;
  }, 2000);
}

socket.on("user-is-typing", (name) => {
  const typingMessage = document.getElementById("typingMessage");

  if (typingMessage) {
    typingMessage.innerText = `${name} is typing...`;
  } else {
    const chatMessages = document.getElementById("chatMessages");
    const newMessage = document.createElement("div");
    newMessage.id = "typingMessage";
    newMessage.className = "chat-message center";
    newMessage.innerHTML = `<p> ${name} is typing... </p>`;
    chatMessages.appendChild(newMessage);
  }
});

socket.on("user-stopped-typing", (name) => {
  const typingMessage = document.getElementById("typingMessage");

  if (typingMessage) {
    typingMessage.remove();
  }
});

function scrollToBottom() {
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateNumberOfPeople(count) {
  const chatPeople = document.getElementById("chatPeople");
  const numberOfPeople = count;
  chatPeople.innerText = `People in the room: ${numberOfPeople}`;
}
