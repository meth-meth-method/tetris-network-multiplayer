class Keyboard
{
    constructor(tetris)
    {
        this.tetris = tetris;

        this.LEFT = 'left';
        this.RIGHT = 'right';
        this.ROTATE_LEFT = 'rleft';
        this.ROTATE_RIGHT = 'rleft';
        this.DROP = 'drop';

        const player = tetris.player;
        this.actions = {
            this.LEFT: () => {
                player.move(-1);
            },
            this.RIGHT: () => {
                player.move(1);
            },
            this.ROTATE_LEFT: () => {
                player.rotate(-1);
            },
            this.ROTATE_RIGHT: () => {
                player.rotate(1);
            }

        }

        this.keyMap = [

        ]


        this.actionMap = Object.create(null, {
            'left': ()
        });
    }

    actionHandler(action)
    {
        const player = tetris.player;
        if (action.type === 'keydown') {
            if (action.code === this.LEFT) {
                player.move(-1);
            } else if (action.code === this.RIGHT) {
                player.move(1);
            } else if (action.code === this.ROTATE_LEFT) {
                player.rotate(-1);
            } else if (action.code === this.ROTATE_RIGHT) {
                player.rotate(1);
            }
        }

        if (action.code === this.DROP) {
            if (action.type === 'keydown') {
                if (player.dropInterval !== player.DROP_FAST) {
                    player.drop();
                    player.dropInterval = player.DROP_FAST;
                }
            } else {
                player.dropInterval = player.DROP_SLOW;
            }
        }
    }
}
