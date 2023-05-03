import { Server, Client } from "./webrtc.js"

const server = new Server();
async function startServer() {
    await server.openRoom(roomId);
    server.addListener("chat", (x) => {
        server.broadcast("chat", { id: x.connId, data: x.payload });
    });
}

const client = new Client();
async function startClient() {
    await client.joinRoom(roomId);
    client.addListener("chat", (data) => {
        const msg = `${data.payload.id}: ${data.payload.data}`
        document.getElementById("messages").value += `${msg}\n`;
    });
    document.getElementById("send").addEventListener("click", () => {
        const text = document.getElementById("message").value;
        document.getElementById("message").value = "";
        client.send("chat", text);
    });
}

if (isHost) startServer().then(startClient);
else startClient();

window.server = server;
window.client = client;
