import { Server, Client } from "./webrtc.js"
import serverActivity from "./server.js"
import clientActivity from "../client/client.js"

const server = new Server();
async function startServer() {
    await server.openRoom(roomId);
    serverActivity(server);
}

export const client = new Client();
async function startClient() {
    await client.joinRoom(roomId);
    clientActivity(client);
}

if (isHost) startServer().then(startClient);
else startClient();

document.getElementById('announce').innerText = `초대코드 : ${roomId}`;

window.server = server;
window.client = client;
