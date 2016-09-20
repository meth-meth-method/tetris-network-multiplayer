const WebSocketServer = require('ws').Server;

const server = new WebSocketServer({port: 9000});

const sessions = new Map;

class Session
{
    constructor(id)
    {
        this.id = id;
    }
}

function createId(len = 6, chars = 'abcdefghjkmnopqrstvwxyz01234567890') {
    let id = '';
    while (len--) {
        id += chars[Math.random() * chars.length | 0];
    }
    return id;
}

server.on('connection', conn => {
    console.log('Connection established');

    conn.on('message', msg => {
        console.log('Message received', msg);

        if (msg === 'create-session') {
            const id = createId();
            const session = new Session(id);
            sessions.set(session.id, session);
        }

        console.log(sessions);
    });

    conn.on('close', () => {
        console.log('Connection closed');
    });
});
