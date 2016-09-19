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
            const msg = JSON.parse(event.data);
            console.log(msg);;
            if (msg.type === 'session-id') {
                window.location.hash = msg.data;
            } else if (msg.type === 'join-session') {
                const sessionId = msg.data;
                const tetris = this.addPlayer();
                this.playerMap.set(sessionId, tetris);
            } else if (msg.type.startsWith('player-')) {
                this.handlePlayerMessage(msg)

            }
        });
        this.connection.addEventListener('open', () => {
            console.log('open!!');
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
        if (!this.playerMap.has(msg.playerId)) {
            console.warn('Player id not found', msg.playerId);
            return;
        }
        const tetris = this.playerMap.get(msg.playerId);
        const player = tetris.player;
        if (type === 'player-position') {
            player.pos.x = data.x;
            player.pos.y = data.y;
        } else if (type === 'player-matrix') {
            player.matrix = data;
        } else if (type === 'player-arena') {
            tetris.arena.matrix = data;
        }
        tetris.draw();
    }

    send(type, data)
    {
        if (this.connection.readyState !== 1) {
            return;
        }
        const msg = JSON.stringify({type, data});
        this.connection.send(msg);
    }
}
