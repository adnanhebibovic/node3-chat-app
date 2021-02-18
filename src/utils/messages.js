class Message {
    constructor(socket) {
        this.socket = socket
    }

    generate(text) {
        return {
            text: text,
            created: new Date(),
            username: this.socket.handshake.auth.user
        }
    }
}

module.exports = Message