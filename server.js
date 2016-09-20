const WebSocketServer = require('ws').Server;

const server = new WebSocketServer({port: 8080});

function createId() {
    const chars = 'abcdefghjkmnopqrstvwxyz01234567890';
    let len = 6;
    let id = '';
    while (len--) {
        id += chars[Math.random() * chars.length | 0];
    }
    return id;
}

class Session
{
    constructor()
    {
        this.id = createId();
        this.players = new Set;
    }
    cast(msg)
    {
        this.players.forEach(player => player.send(msg));
    }
}

class Player
{
    constructor(conn)
    {
        this.id = createId();
        this.conn = conn;
        this.session = null;
    }
    cast(msg)
    {
        if (!this.session) {
            console.warn('Cast without session', type, data);
            return;
        }

        msg.sender = this.id;
        console.log('Broadcasting message', msg);

        this.session.players.forEach(player => {
            if (player === this) {
                return;
            }
            player.send(msg);
        });
    }
    send(msg)
    {
        const json = JSON.stringify(msg);
        console.log('Sending message to', this.id, json);
        this.conn.send(json, (err) => {
            if (err) {
                console.error('Error sending', json, err);
            }
        });
    }
}

const players = new Map;
const sessions = new Map;

server.on('connection', conn => {
    const player = new Player(conn);
    players.set(conn, player);

    console.log('Connection established', player.id);;

    conn.on('message', msg => {
        console.log('Incoming message', msg);
        const {type, data} = JSON.parse(msg);
        if (type === 'create-session') {
            const session = new Session();
            console.log('Creating session', session);
            session.players.add(player);
            player.session = session;
            sessions.set(session.id, session);
            player.send({
                type: 'session-id',
                data: session.id,
            });
        } else if (type === 'join-session') {
            const sessionId = data;
            if (!sessions.has(sessionId)) {
                console.warn('Tried to join unstarted session', sessionId);
                return;
            }
            const session = sessions.get(sessionId);
            console.log('Joining session', session);
            session.players.add(player);
            player.session = session;

            const players = [...session.players];
            players.forEach(player => {
                player.send({
                    type: 'players-available',
                    data: {
                        you: player.id,
                        others: players.filter(p => p !== player).map(p => p.id),
                    },
                });
            });
        } else if (type.startsWith('player-')) {
            const player = players.get(conn);
            if (player.session) {
                player.cast({type, data});
            }
        }
    });
});
