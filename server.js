const WebSocketServer = require("ws").Server
const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, function () {
	console.log('Express server started on port', PORT);
});

let wss = new WebSocketServer({ server: server })
console.log("websocket server created")

wss.on("connection", function (ws) {
	let id = setInterval(function () {
		ws.send(JSON.stringify(new Date()), function () { })
	}, 1000)

	console.log("websocket connection open")

	ws.on("close", function () {
		console.log("websocket connection close")
		clearInterval(id)
	})
})