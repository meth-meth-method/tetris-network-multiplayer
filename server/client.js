class Client
{
    constructor(conn, id)
    {
        this.conn = conn;
        this.id = id;
        this.session = null;
    }

    send(data)
    {
        const msg = JSON.stringify(data);
        console.log(`Sending message ${msg}`);
        this.conn.send(msg)
    }
}

module.exports = Client;
