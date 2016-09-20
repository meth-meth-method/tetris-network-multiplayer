class Client
{
    constructor(conn)
    {
        this.conn = conn;
        this.session = null;
    }

    send(msg)
    {
        console.log(`Sending message ${msg}`);
        this.conn.send(msg)
    }
}

module.exports = Client;
