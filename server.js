const WebSocketServer = require('ws').Server;

const server = new WebSocketServer({port: 8080});

const sessions = new Map;

server.on('connection', conn => {
    console.log(conn);

    conn.on('message', msg => {

    });
});
