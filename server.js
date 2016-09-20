const WebSocketServer = require('ws').Server;

const server = new WebSocketServer({port: 8080});

const players = new Map;
const sessions = new Map;

class Session
{
    constructor(id)
    {
        this.id = id;
        this.players = new Set;
    }
    leave(player)
    {
        this.players.delete(player);
    }
    join(player)
    {
        if (this.players.has(player)) {
            console.warn('Player already in session', this, player);
            return;
        }

        this.players.add(player);
        player.session = this;
        player.send({
            type: 'session-id',
            data: this.id,
        });
    }
    cast(msg)
    {
        this.players.forEach(player => {
            player.send(msg);
        });
    }
}

class Player
{
    constructor(conn)
    {
        this.id = createId();
        this.conn = conn;
        this.session = null;

        this.state = {
            arena: {
                matrix: [],
            },
            player: {
                pos: {x: 0, y: 0},
                matrix: [],
                score: 0,
            },
        };
    }
    cast(msg)
    {
        if (!this.session) {
            console.warn('Cast without session', type, data);
            return;
        }

        msg.sender = this.id;

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
        console.log(`Sending message to ${this.id} ${json}`);
        this.conn.send(json, function ack(err) {
            if (err) {
                console.error('Error sending', json, err);
            }
        });
    }
}

function createId() {
    const chars = 'abcdefghjkmnopqrstvwxyz01234567890';
    let len = 6;
    let id = '';
    while (len--) {
        id += chars[Math.random() * chars.length | 0];
    }
    return id;
}

function createSession(id = createId()) {
    if (sessions.has(id)) {
        throw new Error(`Session ${id} already exists`);
    }

    const session = new Session(id);
    console.log('Creating session', session);

    sessions.set(id, session);

    return session;
}

function getSession(id) {
    return sessions.get(id);
}

function broadcastSessionSync(session) {
    const players = [...session.players];
    players.forEach(player => {
        player.send({
            type: 'players-available',
            data: {
                you: player.id,
                players: players.map(p => p.id),
            },
        });
    });
}

server.on('connection', conn => {
    const player = new Player(conn);
    players.set(conn, player);

    console.log('Connection established', player.id);;

    conn.on('message', msg => {
        console.log('Incoming message', msg);

        const {type, data} = JSON.parse(msg);

        if (type === 'create-session') {

            const session = createSession();
            session.join(player);

        } else if (type === 'join-session') {

            const session =  getSession(data) || createSession(data);
            session.join(player);
            broadcastSessionSync(session);

        } else if (type.startsWith('player-')) {

            const player = players.get(conn);
            player.cast({type, data});

        }
    });

    conn.on('close', function close() {
        console.log('Connection closed', player.id);
        const session = player.session;
        players.delete(conn);
        session.leave(player);
        broadcastSessionSync(session);
        if (session.players.size === 0) {
            console.log('Session empty, deleting', session);
            sessions.delete(session);
        }
    });
});
