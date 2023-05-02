import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const __dirname = path.resolve();
const app = express();
app.use(express.static("public"));
app.get("/", async (req, res, next) => {
    res.sendFile(__dirname + "/index.html");
});

const server = http.createServer(app);
const wss = new Server(server);
server.listen(3000);


const rooms = {};

wss.on("connection", socket => {
    socket.on("createRoom", () => {
        const randomId = Math.random().toString(36).slice(2, 16);
        rooms[randomId] = {
            host: socket.id,
        };
        socket.join(randomId);
        console.log(socket.id, "createRoom", randomId, rooms);
        socket.emit("createRoom", randomId);
    });
    socket.on("offer", async (payload) => {
        const { roomId, connId, offer } = payload;
        console.log(socket.id, "offer", connId, roomId);
        if (rooms[roomId] == null)
            return; // TODO: deny offer
        const hostSocket = wss.sockets.sockets.get(rooms[roomId].host);
        if (hostSocket == null)
            return; // TODO: deny offer
        await hostSocket.join(connId);
        await socket.join(connId);
        socket.to(connId).emit("offer", { connId, offer });
    });
    socket.on("answer", (payload) => {
        const { connId, answer } = payload;
        console.log(socket.id, "answer", connId)
        socket.to(connId).emit("answer", { connId, answer });
    });
    socket.on("ice", (payload) => {
        const { candidate, connId } = payload;
        console.log(socket.id, "ice", connId);
        socket.to(connId).emit("ice", { candidate, connId });
    });
    socket.on("freezeRoom", (payload) => {
        const { roomId } = payload;
        console.log("freezeRoom", roomId);
        if (rooms[roomId])
            delete rooms[roomId];
    });
});
