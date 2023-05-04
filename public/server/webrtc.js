class Network {
    /**
     * @callback createRoomCallback
     * @param {string} roomId
     */
    /**
     * @callback dataListener
     * @param {{connId: string, payload: any}} json
     */

    constructor() {
        /**
         * @type {Array<Connection>}
         */
        this.connections = [];
        this.socket = io();
        this.roomId = null;
        this.isHost = false;
        /**
         * @type {Object<string, Array<dataListener>>}
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
        this.stateListener = null;
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
            const { candidate, connId } = payload;
            const connection = this.connections.find(x => x.connId === connId);
            if (connection === undefined)
                return; // TODO: error handling
            connection.conn.addIceCandidate(candidate);
        });
    }

    /**
     * @param {string} roomId
     * @param {createRoomCallback} createRoomCallback 
     */
    createRoom(roomId, createRoomCallback) {
        this.createRoomCallback = createRoomCallback;
        this.isHost = true;
        this.socket.emit("createRoom", { roomId });
    }

    freezeRoom() {
        if (this.isHost == false)
            return;
        this.socket.emit("freezeRoom", { roomId: this.roomId });
        this.socket.close();
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
            throw new Error("Connection not found");
        connection.send(this.#packPayload(connId, type, payload));
    }

    /**
     * @param {string} type 
     * @param {Object} payload javascript object for parsing to json
     */
    broadcase(type, payload) {
        this.connections.forEach(x => {
            if (x.channel.readyState === "open")
                x.send(this.#packPayload(x.connId, type, payload));
        });
    }

    /**
     * @param {string} type
     * @param {dataListener} listener 
     */
    addListener(type, listener) {
        if (this.eventListeners[type] == null)
            this.eventListeners[type] = [];
        this.eventListeners[type].push(listener);
    }

    /**
     * @param {stateListener} stateListener 
     */
    setStateListener(stateListener) {
        this.stateListener = stateListener;
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
        const isSingleConn = connId == null;
        if (connId == null)
            connId = Math.random().toString(36).slice(2, 16);
        const connection = new Connection(connId, this.socket, (conn, state) => {
            if (isSingleConn && state !== "connecting")
                this.socket.close();
            if (this.stateListener != null)
                this.stateListener(conn, state);
        });
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
    /**
     * @callback stateListener
     * @param {Connection} conn
     * @param {string} state
     */

    /**
     * @param {string} connId
     * @param {socket} socket
     * @param {stateListener} stateListener
     */
    constructor(connId, socket, stateListener) {
        this.connId = connId;
        this.socket = socket;
        this.listener = console.log;
        const stuns = {
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                        "stun:stun3.l.google.com:19302",
                        "stun:stun4.l.google.com:19302",
                    ],
                },
            ],
        }
        this.conn = new RTCPeerConnection(stuns);
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
        this.conn.addEventListener("connectionstatechange", () => {
            if (stateListener != null)
                stateListener(this, this.conn.connectionState);
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

function createNetwork() {
    this.net = new Network();
    this.net.setStateListener((conn, state) => {
        if (this.state[conn.connId] == null)
            this.state[conn.connId] = "connecting";
        this.state[conn.connId] = state;
        this.connListener.forEach((x) => x(conn.connId, state));
    });
}

class Node {
    /**
     * @callback connectListener
     * @param {string} connId
     * @param {string} state
     */

    constructor() {
        /**
         * @type {Network}
         */
        this.net = null;
        this.state = {};
        this.connListener = [console.log];
    }

    /**
     * @param {string} type
     * @param {dataListener} listener 
    */
    addEventListener(type, listener) {
        if (this.net === null)
            throw new Error("No rtc is setup");
        this.net.addListener(type, listener);
    }

    /**
     * @param {connectListener} event
     */
    addConnListener(event) {
        this.connListener.push(event);
    }
}

/**
 * @implements {Node}
 */
export class Server extends Node {
    constructor() {
        super();
        this.roomId = null;
    }

    /**
     * Open a room to receive users.
     * @param {string} roomId
     * @returns {Promise<string>} room id
     */
    openRoom(roomId) {
        if (this.net === null)
            createNetwork.bind(this)();
        return new Promise((res) => {
            if (this.roomId !== null) {
                res(this.roomId);
                return;
            }
            this.net.createRoom(roomId, (roomId) => {
                this.roomId = roomId;
                res(roomId);
            });
        });
    }

    /**
     * No longer accepting users.
     */
    freezeRoom() {
        if (this.net === null)
            return;
        this.net.freezeRoom();
    }

    broadcast(type, payload) {
        if (this.net === null)
            throw new Error("No rtc is setup");
        this.net.broadcase(type, payload);
    }

    /**
     * @returns {Array<string>}
     */
    getConnIds() {
        if (this.net === null)
            throw new Error("No rtc is setup");
        return this.net.connections.map(x => x.connId);
    }

    /**
     * @param {string} connId 
     * @param {string} type 
     * @param {Object} payload javascript object for parsing to json
     */
    send(connId, type, payload) {
        if (this.net === null)
            throw new Error("No rtc is setup");
        this.net.send(connId, type, payload);
    }
}

/**
 * @extends {Node}
 */
export class Client extends Node {
    constructor() {
        super();
    }

    /**
     * @param {string} roomId
     * @returns {Promise<string>} connection id
     */
    async joinRoom(roomId) {
        if (this.net === null) {
            createNetwork.bind(this)();
        }
        await this.net.joinRoom(roomId);
        return new Promise((res, rej) => {
            const id = setInterval(() => {
                const connId = this.net.connections[0].connId;
                if (this.state[connId] == null || this.state[connId] === "connecting")
                    return;
                if (this.state[connId] === "connected" || this.state[connId] === "open")
                    res(this.net.getConnIds()[0]);
                else
                    rej(this.state[connId]);
                clearInterval(id);
            }, 100);
        });
    }

    send(type, payload) {
        if (this.net === null)
            throw new Error("No rtc is setup");
        const connId = this.net.connections[0].connId;
        this.net.send(connId, type, payload);
    }
}
