class Network {
    /**
     * @callback createRoomCallback
     * @param {string} roomId
     */
    /**
     * @callback jsonListener
     * @param {Object} json
     */

    constructor() {
        /**
         * @type {Array<Connection>}
         */
        this.connections = [];
        this.socket = io();
        this.roomId = null;
        /**
         * @type {Object<string, Array<jsonListener>>}
         */
        this.eventListeners = {};
        this._eventListener = (msg) => {
            const data = this.#unpackPayload(msg)
            for (const listenerType in this.eventListeners) {
                const listeners = this.eventListeners[listenerType];
                if (listenerType === data.type)
                    listeners.forEach(x => x(data));
            }
        };
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

    /**
     * @returns {Array<string>}
     */
    getConnIds() {
        return this.connections.map(x => x.connId);
    }

    /**
     * @param {string} connId 
     * @param {string} type 
     * @param {Object} payload javascript object for parsing to json
     */
    send(connId, type, payload) {
        const connection = this.connections.find(x => x.connId === connId);
        if (connection == null)
            throw new Error();
        connection.send(this.#packPayload(connId, type, payload));
    }

    /**
     * @param {string} type 
     * @param {Object} payload javascript object for parsing to json
     */
    broadcase(type, payload) {
        this.connections.forEach(x => {
            x.send(this.#packPayload(x.connId, type, payload));
        });
    }

    /**
     * @param {string} type
     * @param {jsonListener} listener 
     */
    addListener(type, listener) {
        if (this.eventListeners[type] == null)
            this.eventListeners[type] = [];
        this.eventListeners[type].push(listener);
    }

    #packPayload(connId, type, payload) {
        return JSON.stringify({
            connId,
            type,
            payload
        });
    }

    #unpackPayload(object) {
        return JSON.parse(object);
    }

    #createConnection(connId) {
        if (connId == null)
            connId = Math.random().toString(36).slice(2, 16);
        const connection = new Connection(connId, this.socket);
        connection.setListener(this._eventListener);
        this.connections.push(connection);
        return connection;
    }
}



class Connection {
    /**
     * @callback messageListener
     * @param {string} data
     */

    constructor(connId, socket) {
        this.connId = connId;
        this.socket = socket;
        this.listener = console.log;
        this.conn = new RTCPeerConnection();
        this.channel = this.conn.createDataChannel("data");
        this.channel.addEventListener("message", (event) => this.listener(event.data));
        this.conn.addEventListener("icecandidate", (data) => {
            const payload = {
                candidate: data.candidate,
                connId: this.connId,
            }
            this.socket.emit("ice", payload);
        });
        this.conn.addEventListener("datachannel", (event) => {
            this.channel = event.channel;
            this.channel.addEventListener("message", (event) => this.listener(event.data));
        });
    }

    /**
     * @param {string} msg 
     */
    send(msg) {
        this.channel.send(msg);
    }

    /**
     * @param {messageListener} listener 
     */
    setListener(listener) {
        this.listener = listener;
    }
}

const net = new Network();

net.addListener("chat", (x) => {
    document.getElementById("messages").value += `${x.payload}\n`;
});

document.getElementById("send").addEventListener("click", () => {
    const text = document.getElementById("message").value;
    document.getElementById("message").value = "";
    net.broadcase("chat", text);
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
