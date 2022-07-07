// si esta en diferente server, colocar el dominio como parametro
const socket = io();

// DOM elements
const message = document.getElementById("message");
const username = document.getElementById("username");
const btnSend = document.getElementById("send");
const btnConnect = document.getElementById("connect");
const output = document.getElementById("output");
const actions = document.getElementById("actions");
const chatWindow = document.getElementById("chat-window");
const chatMessage = document.getElementById("chat-message");
const chatUsername = document.getElementById("chat-username");

btnSend.addEventListener("click", () => {
	// envia los datos al servidor
	if (username.value !== "" && message.value.length > 0) {
		socket.emit("chat:message", {
			username: username.value,
			message: message.value,
		});
		message.value = "";
	} else {
		actions.innerHTML = "<p><em>Escriba un mensaje</em></p>";
	}
});

btnConnect.addEventListener("click", () => {
	if (username.value !== "") {
		chatUsername.style.display = "none";
		chatWindow.style.display = "block";
		chatMessage.style.display = "block";

		socket.emit("chat:user_connection", username.value);
	} else {
		alert("Ingrese un nombre de usuario");
	}
});

message.addEventListener("keypress", () => {
	socket.emit("chat:typing", username.value);
});

// recibe los datos del servidor
socket.on("chat:message", (data) => {
	actions.innerHTML = "";
	output.innerHTML += `<p>
    <strong>${data.username}</strong>: ${data.message}
  </p>`;
	chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on("chat:user_connection", (username) => {
	output.innerHTML += `<p>
    <strong>${username}</strong>: se ha conectado...
  </p>`;
});

socket.on("chat:typing", (data) => {
	actions.innerHTML = `<p><em>${data} is typing...</em></p>`;
});
