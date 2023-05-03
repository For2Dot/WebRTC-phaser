import { Server, Client } from "./webrtc.js"
import serverActivity from "./server.js"
import clientActivity from "./client.js"

const server = new Server();
async function startServer() {
    await server.openRoom(roomId);
    serverActivity(server);
}

const client = new Client();
async function startClient() {
    await client.joinRoom(roomId);
    clientActivity(client);
}

if (isHost) startServer().then(startClient);
else startClient();

window.server = server;
window.client = client;
