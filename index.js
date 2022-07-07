const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

// inicializar express
const app = express();

// settings server
app.set("port", process.env.PORT || 3000);

// static files
app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(app.get("port"), () => {
	console.log(`server running: http://localhost:${app.get("port")}/`);
});

// settings websocket
const io = new Server(server);

io.on("connection", (socket) => {
	console.log("new connetion", socket.id);

	// escucha los datos del cliente
	// envia un mensaje en texto plano y objeto JSON
	socket.on("chat:message", (data) => {
		// envia los datos a las demas conexiones (incluye el que lo envio)
		io.sockets.emit("chat:message", data);
	});

	// envia un mensaje en texto plano
	socket.on("chat:typing", (data) => {
		// envia los datos a las demás conexiones (excluye el que lo envio)
		socket.broadcast.emit("chat:typing", data);
	});

	// envia un mensaje de conexión a los usuarios
	socket.on("chat:user_connection", (username) => {
		io.sockets.emit("chat:user_connection", username);
	});
});
