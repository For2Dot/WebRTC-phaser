// https://github.com/nomadcoders/noom/blob/master/src/server.js

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
    socket.on("createRoom", async () => {
        const randomId = Math.random().toString(36).slice(2, 16);
        rooms[randomId] = {
            host: socket.id,
        };
        socket.join(randomId);
        console.log(socket.id, "createRoom", randomId, rooms);
        socket.emit("createdRoom", randomId);
    });
    socket.on("joinRoom", async (roomId) => {
        console.log(socket.id, "joinRoom", roomId);
        const room = rooms[roomId];
        if (room == null)
            return;
        const hostSocket = wss.sockets.sockets.get(room.host);
        if (hostSocket == null)
            return;
        await socket.join(roomId);
        hostSocket.emit("joinRoom", socket.id);
    });
    socket.on("offer", (offer, id) => {
        console.log(socket.id, "offer", id);
        const target = wss.sockets.sockets.get(id);
        if (target == null)
            return;
        target.emit("offer", offer, socket.id);
    });
    socket.on("answer", (answer, id) => {
        console.log(socket.id, "answer", id);
        const target = wss.sockets.sockets.get(id);
        if (target == null)
            return;
        target.emit("answer", answer, id);
    });
    socket.on("ice", (ice, roomId) => {
        console.log(socket.id, "ice", ice, roomId);
        socket.to(roomId).emit("ice", ice);
    });
});
