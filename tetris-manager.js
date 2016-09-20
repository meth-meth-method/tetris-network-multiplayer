class TetrisManager
{
    constructor(document)
    {
        this.document = document;
        this.template = this.document.querySelector('#player-template');
        console.log(this.template);

        this.tetri = [];

        const playerElements = this.document.querySelectorAll('.player');
        [...playerElements].forEach(element => {
            const tetris = new Tetris(element);
            this.tetri.push(tetris);
        });
    }
}
