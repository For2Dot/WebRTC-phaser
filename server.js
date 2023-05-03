import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const __dirname = path.resolve();
const app = express();
const rooms = {};
app.set('view engine', 'ejs');

app.get("/new", async (req, res, next) => {
    const roomId = Math.random().toString(36).slice(2, 16);
    rooms[roomId] = {};
    res.redirect(`/join/${roomId}`);
});

app.use(express.static("public"));
app.get("/join/:roomId", async (req, res, next) => {
    const roomId = req.params.roomId;
    if (rooms[roomId] == null) {
        res.sendStatus(404);
        return;
    }
    let isHost = false;
    if (rooms[roomId].checkout == null) {
        isHost = true;
        rooms[roomId].checkout = true;
    }
    res.render("room", { roomId, isHost });
});

const server = http.createServer(app);
const wss = new Server(server);
server.listen(3000);

wss.on("connection", socket => {
    socket.on("createRoom", (payload) => {
        const { roomId } = payload;
        if (rooms[roomId] == null || rooms[roomId].checkout == null)
            return;
        rooms[roomId].host = socket.id;
        socket.join(roomId);
        console.log(socket.id, "createRoom", roomId, rooms);
        socket.emit("createRoom", roomId);
    });
    socket.on("offer", async (payload) => {
        const { roomId, connId, offer } = payload;
        console.log(socket.id, "offer", connId, roomId);
        if (rooms[roomId] == null || rooms[roomId].checkout == null || rooms[roomId].host == null)
            return;
        const hostSocket = wss.sockets.sockets.get(rooms[roomId].host);
        if (hostSocket == null)
            return;
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
