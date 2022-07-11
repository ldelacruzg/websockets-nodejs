// si esta en diferente server, colocar el dominio como parametro
const socket = io();

// DOM elements
const message = document.getElementById("message");
const username = document.getElementById("username");
const file = document.getElementById("file");
const btnSend = document.getElementById("send");
const btnConnect = document.getElementById("connect");
const output = document.getElementById("output");
const actions = document.getElementById("actions");
const chatWindow = document.getElementById("chat-window");
const chatMessage = document.getElementById("chat-message");
const chatUsername = document.getElementById("chat-username");
const dataEmpty = { message: "", file: "" };

/**
 * Eventos que se envian al servidor
 */

// envia a los demás usuarios la conexión
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

// envia a los demás usuarios quien está escribiendo
message.addEventListener("keypress", () => {
	socket.emit("chat:typing", username.value);
});

// se envia el mensaje si se presiona enter
chatMessage.addEventListener("keyup", (e) => {
	if (e.code === "Enter" || e.code === "NumpadEnter") {
		handleSend();
	}
});

// se envia el mensaje si se da click al botón enviar
btnSend.addEventListener("click", handleSend);

/**
 * Eventos que se reciben del servidor
 */

// se recibe el dato (username) de la conexión (texto plano)
socket.on("chat:user_connection", (username) => {
	output.innerHTML += `<p>
    <strong>${username}</strong>: se ha conectado...
  </p>`;
});

// se recibe el nombre de la persona que está escribiendo (texto plano)
socket.on("chat:typing", (data) => {
	actions.innerHTML = `<p><em>${data} is typing...</em></p>`;
});

// se recibe los datos del mensaje (json)
socket.on("chat:message", (data) => {
	// limpio las acciones
	actions.innerHTML = "";

	// creación del elemento para mostrar el mensaje
	const el = document.createElement("p");
	data.username !== username.value ? el.classList.add("text-end") : "";
	el.innerHTML += `<strong>${data.username}</strong>: ${data.message}`;
	el.innerHTML += data.file
		? `<a download href="${data.file.meta}">${data.file.name}</a>`
		: "";
	output.appendChild(el);
	chatWindow.scrollTop = chatWindow.scrollHeight;
});

// funtions
function handleSend() {
	// se obtiene el archivo a enviar
	const selectedFile = file.files[0];
	// se captura el mensaje a enviar
	const capturedMessage = message.value;

	// se válida si por lo menos hay un mensaje ó un archivo a enviar sino...
	if (capturedMessage || selectedFile) {
		// capturar los datos
		let data = {
			...dataEmpty,
			username: username.value,
		};

		// capturar mensaje
		if (capturedMessage) {
			data.message = capturedMessage;
		}

		// verifica si hay un archivo sino...
		if (selectedFile) {
			const reader = handleFile(selectedFile);

			// capturar el archivo leído
			reader.onload = () => {
				// enviar mensaje con archivo
				data.file = {
					name: selectedFile.name,
					meta: reader.result,
				};
				socket.emit("chat:message", data);
			};
		} else {
			// enviar mensaje sin archivo
			socket.emit("chat:message", data);
		}

		// limpiar inputs
		message.value = "";
		file.value = "";
	} else {
		actions.innerHTML = `
			<p>
				<em>Escriba un mensaje ó seleccione un archivo...</em>
			</p>`;
	}
}

function handleFile(ofile) {
	const blob = new Blob([ofile], { type: ofile.type });
	const reader = new FileReader();
	reader.readAsDataURL(blob);
	return reader;
}
