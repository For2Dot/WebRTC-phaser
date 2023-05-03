import { Client } from "./webrtc.js";

/**
 * @param {Client} client 
 */
export default function activity(client) {
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
