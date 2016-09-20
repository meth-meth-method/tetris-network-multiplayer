class Client
{
    constructor(conn)
    {
        this.conn = conn;
        this.session = null;
    }
}

module.exports = Client;
