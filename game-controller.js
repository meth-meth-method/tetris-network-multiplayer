class GameController
{
    constructor(document)
    {
        this.document = document;
        this.playerElements = this.document.querySelector('.players');
        this.template = this.playerElements.querySelector('template.player');

        this.tetri = [];

        this.playerMap = new Map;

        this.connection = new WebSocket('ws://localhost:8080');
        this.connection.addEventListener('message', event => {
            console.log('Received message', event, event.data);
            const msg = JSON.parse(event.data);

            if (msg.type === 'session-id') {
                window.location.hash = msg.data;
            } else if (msg.type === 'join-session') {

            } else if (msg.type === 'players-available') {
                console.log(msg);
                msg.data.others.forEach(playerId => {
                    if (!this.playerMap.has(playerId)) {
                        const tetris = this.addPlayer();
                        this.playerMap.set(playerId, tetris);
                    }
                });
            } else if (msg.type.startsWith('player-')) {
                this.handlePlayerMessage(msg)

            }
        });
        this.connection.addEventListener('open', () => {
            console.log('Connection open');

            const sessionId = window.location.hash.split('#')[1];
            if (sessionId) {
                this.send('join-session', sessionId);
            } else {
                this.send('create-session', null);
            }

            const host = this.tetri[0];
            const player = host.player;
            player.event.listen('position-update', () => {
                this.send('player-position', player.pos);
            });
            player.event.listen('matrix-update', () => {
                this.send('player-matrix', player.matrix);
            });
            player.event.listen('arena-update', () => {
                this.send('player-arena', host.arena.matrix);
            });
        });
    }

    addPlayer()
    {
        const element = document.importNode(this.template.content, true);
        const tetris = new Tetris(element);
        this.tetri.push(tetris);
        this.playerElements.appendChild(tetris.element);
        return tetris;
    }

    handlePlayerMessage(msg)
    {
        if (!this.playerMap.has(msg.sender)) {
            console.warn('Player id not found', msg.sender);
            return;
        }
        const tetris = this.playerMap.get(msg.sender);
        const player = tetris.player;
        if (msg.type === 'player-position') {
            player.pos.x = msg.data.x;
            player.pos.y = msg.data.y;
        } else if (msg.type === 'player-matrix') {
            player.matrix = msg.data;
        } else if (msg.type === 'player-arena') {
            tetris.arena.matrix = msg.data;
        }
        tetris.draw();
    }

    send(type, data)
    {
        if (this.connection.readyState !== 1) {
            console.warn('Connection not ready');
            return;
        }
        const msg = JSON.stringify({type, data});
        console.log('Sending message', msg);
        this.connection.send(msg);
    }
}
