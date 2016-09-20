class ConnectionManager
{
    constructor()
    {
        this.conn = null;
    }

    connect(address)
    {
        this.conn = new WebSocket(address);

        this.conn.addEventListener('open', () => {
            console.log('Connection established');

            this.conn.send('create-session');
        });

        this.conn.addEventListener('message', event => {
            console.log('Received message', event.data);
        });
    }
}
