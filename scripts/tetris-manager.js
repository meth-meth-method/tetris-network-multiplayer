class TetrisManager
{
    constructor(document)
    {
        this.document = document;
        this.template = this.document.querySelector('#player-template');

        this.tetri = [];
    }

    createPlayer()
    {
        const element = document
            .importNode(this.template.content, true)
            .children[0];

        const tetris = new Tetris(element);

        this.document.body.appendChild(tetris.element);

        return tetris;
    }
}
