const WebSocketServer = require('ws').Server;

const server = new WebSocketServer({port: 9000});

server.on('connection', conn => {
    console.log('Connection established');

    conn.on('close', () => {
        console.log('Connection closed');
    });
});
