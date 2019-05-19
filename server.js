const http = require('http');
const app = require('./app'); 

const PORT = process.env.port || 5000;

const server = http.createServer(app);
server.set('port', process.env.PORT || 5000);
server.listen(server.get('port'), function () {
	console.log('Express server started on port', server.get('port'));
});
