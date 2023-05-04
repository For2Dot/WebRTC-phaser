import { Server } from "./webrtc.js";

/**
 * @param {Server} server 
 */
export default function activity(server) {
    server.addEventListener("chat", ({ connId, payload }) => {
        server.broadcast("chat", { id: connId, chat: payload });
    });
}
