const http = require('http');
const app = require('./app'); 

const PORT = process.env.port || 5000;

const server = http.createServer(app);

server.listen(PORT, function () {
	console.log('Express server started on port', PORT);
});
