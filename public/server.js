import { Server } from "./webrtc.js";

/**
 * @param {Server} server 
 */
export default function activity(server) {
    server.addListener("chat", (x) => {
        server.broadcast("chat", { id: x.connId, data: x.payload });
    });
}
