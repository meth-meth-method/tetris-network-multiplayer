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
            this.send({
                type: 'create-session',
            });
        });

        this.conn.addEventListener('message', event => {
            console.log('Received message', event.data);
        });
    }

    send(data)
    {
        const msg = JSON.stringify(data);
        console.log('Sending message', msg);
        this.conn.send(msg);
    }
}
