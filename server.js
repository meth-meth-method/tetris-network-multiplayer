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
    cast(type, data)
    {
        this.players.forEach(player => player.send(type, data));
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
    cast(type, data)
    {
        if (!this.session) {
            console.warn('Cast without session', type, data);
            return;
        }

        console.log('Broadcasting message', type, data);

        this.session.players.forEach(player => {
            if (player === this) {
                return;
            }
            player.send(type, data);
        });
    }
    send(type, data)
    {
        const msg = JSON.stringify({
            type,
            data,
            playerId: this.id,
        });

        this.conn.send(msg);
    }
}

const players = new Map;
const sessions = new Map;

server.on('connection', conn => {
    const player = new Player(conn);
    players.set(conn, player);

    conn.on('message', msg => {
        console.log('Incoming message', msg);
        const {type, data} = JSON.parse(msg);
        if (type === 'create-session') {
            const session = {
                id: createId(),
                players: new Set([player]),
            }
            console.log('Creating session', session);

            sessions.set(session.id, session);
            player.session = session;
            player.send('session-id', session.id);
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
            player.cast('join-session', player.id);


        } else if (type.startsWith('player-')) {
            const player = players.get(conn);
            if (player.session) {
                player.cast(type, data);
            }
        }
    });
});
