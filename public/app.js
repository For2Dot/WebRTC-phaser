class Network {
    /**
     * @callback createRoomCallback
     * @param {string} roomId
     */

    constructor() {
        this.connections = [];
        this.socket = io();
        this.roomId = null;
        this.socket.on("createRoom", (roomId) => {
            this.roomId = roomId;
            if (this.createRoomCallback != null)
                this.createRoomCallback(roomId);
        });
        this.socket.on("offer", async (payload) => {
            const { connId, offer } = payload;
            const connection = this.#createConnection(connId);
            await connection.conn.setRemoteDescription(offer);
            const answer = await connection.conn.createAnswer();
            await connection.conn.setLocalDescription(answer);
            this.socket.emit("answer", { connId, answer });
        });
        this.socket.on("answer", async (payload) => {
            const { connId, answer } = payload;
            const connection = this.connections.find(x => x.connId === connId);
            if (connection === undefined)
                return; // TODO: error handling
            await connection.conn.setRemoteDescription(answer);
        });
        this.socket.on("ice", (payload) => {
            console.log(payload);
            const { candidate, connId } = payload;
            const connection = this.connections.find(x => x.connId === connId);
            if (connection === undefined)
                return; // TODO: error handling
            connection.conn.addIceCandidate(candidate);
        });
    }

    /**
     * @param {createRoomCallback} createRoomCallback 
     */
    createRoom(createRoomCallback) {
        this.createRoomCallback = createRoomCallback;
        this.socket.emit("createRoom");
    }

    /**
     * @param {string} roomId
     */
    async joinRoom(roomId) {
        const connection = this.#createConnection();
        const connId = connection.connId;
        const offer = await connection.conn.createOffer();
        await connection.conn.setLocalDescription(offer);
        this.socket.emit("offer", { roomId, connId, offer });
    }

    #createConnection(connId) {
        if (connId == null)
            connId = Math.random().toString(36).slice(2, 16);
        const connection = new Connection(connId, this.socket);
        this.connections.push(connection);
        return connection;
    }
}

class Connection {
    constructor(connId, socket) {
        this.connId = connId;
        this.socket = socket;
        this.action = console.log;
        this.conn = new RTCPeerConnection();
        this.channel = this.conn.createDataChannel("data");
        this.channel.addEventListener("message", (event) => this.action(event));
        this.conn.addEventListener("icecandidate", (data) => {
            const payload = {
                candidate: data.candidate,
                connId: this.connId,
            }
            this.socket.emit("ice", payload);
        });
        this.conn.addEventListener("datachannel", (event) => {
            this.channel = event.channel;
            this.channel.addEventListener("message", (event) => this.action(event));
        });
    }
}

const net = new Network();

document.getElementById("send").addEventListener("click", () => {
    // const text = document.getElementById("message").value;
    // document.getElementById("message").value = "";
    // myDataChannel.send(text);
});

document.getElementById("createRoom").addEventListener("click", () => {
    net.createRoom((roomId) => {
        document.getElementById("message").value = roomId;
    });
});

document.getElementById("joinRoom").addEventListener("click", () => {
    roomId = document.getElementById("message").value;
    document.getElementById("message").value = "";
    net.joinRoom(roomId);
});
