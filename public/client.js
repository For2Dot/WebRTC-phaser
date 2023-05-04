import { Client } from "./webrtc.js";

const data = [];
window.data = data;
/**
 * @param {Client} client 
 */
export default function activity(client) {
    setInterval(render, 50);
    client.addListener("chat", (x) => {
        const idx = data.findIndex(chat => chat.id === x.payload.id);
        if (idx === -1)
            data.push({ id: x.payload.id });
        data.find(chat => chat.id === x.payload.id).chat = x.payload.data;
    });
    document.getElementById("message").addEventListener("input", (x) => {
        client.send("chat", x.currentTarget.value);
    })
}

function render() {
    const text = data.map(x => `${x.id}: ${x.chat}`).join("\n");
    document.getElementById("messages").value = text;
}
