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
            console.log('Received message', event.data);
            this.handleMessage(JSON.parse(event.data));
        });
        this.connection.addEventListener('open', () => {
            console.log('Connection open');

            const sessionId = window.location.hash.split('#')[1];
            if (sessionId) {
                this.send('join-session', sessionId);
            } else {
                this.send('create-session', null);
            }

            const tetris = this.tetri[0];
            const player = tetris.player;
            player.event.listen('score-update', () => {
                this.sendPlayerScore(player);
            });
            player.event.listen('position-update', () => {
                this.sendPlayerPosition(player);
            });
            player.event.listen('matrix-update', () => {
                this.sendPlayerMatrix(player);
            });
            player.event.listen('arena-update', () => {
                this.sendArenaMatrix(tetris.arena);
            });
        });
    }

    addPlayer()
    {
        const element = document.importNode(this.template.content, true).children[0];
        const tetris = new Tetris(element);
        this.tetri.push(tetris);
        this.playerElements.appendChild(tetris.element);
        return tetris;
    }

    removePlayer(tetris)
    {
        this.playerElements.removeChild(tetris.element);
    }

    handleMessage(msg)
    {
        if (msg.type === 'session-id') {
            window.location.hash = msg.data;
        } else if (msg.type === 'join-session') {
            this.sendGameState(this.tetri[0]);
        } else if (msg.type === 'players-available') {
            const me = msg.data.you;
            const players = msg.data.players;
            players.forEach(playerId => {
                if (playerId === me) {
                    return;
                }

                if (!this.playerMap.has(playerId)) {
                    const tetris = this.addPlayer();
                    this.playerMap.set(playerId, tetris);
                }
            });

            [...this.playerMap.entries()].forEach(([id, tetris]) => {
                if (players.indexOf(id) === -1) {
                    this.removePlayer(tetris);
                    this.playerMap.delete(id);
                }
            });
        } else if (msg.type.startsWith('player-')) {
            this.handlePlayerMessage(msg)
        }
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
        } else if (msg.type === 'player-score') {
            tetris.updateScore(msg.data);
        }
        tetris.draw();
    }

    sendGameState(tetris)
    {
        this.sendArenaMatrix(tetris.arena);
        this.sendPlayerPosition(tetris.player);
        this.sendPlayerMatrix(tetris.player);
        this.sendPlayerScore(tetris.player);
    }

    sendArenaMatrix(arena)
    {
        this.send('player-arena', arena.matrix);
    }

    sendPlayerPosition(player)
    {
        this.send('player-position', player.pos);
    }

    sendPlayerScore(player)
    {
        this.send('player-score', player.score);
    }

    sendPlayerMatrix(player)
    {
        this.send('player-matrix', player.matrix);
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
