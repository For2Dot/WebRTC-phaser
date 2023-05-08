import { Client } from "./webrtc.js";
import clientData from "./../client/data.js";


const data = [];
window.data = data;
/**
 * @param {Client} client 
 */
export default function activity(client) {
    setInterval(render, 50);
    clientData.onKeyEvent = (keyData) => {
        client.send("keyPress", keyData);
    };

    // if the browser tab focus is changed, send keyup event to server
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && clientData.isStarted == true) {
            clientData.keyState = {};
            client.send("keyPress", { inputId: "up", state: false });
            client.send("keyPress", { inputId: "down", state: false });
            client.send("keyPress", { inputId: "left", state: false });
            client.send("keyPress", { inputId: "right", state: false });
        }
    });


    client.addEventListener("start", ({ connId, payload }) => {
        clientData.connId = connId;
        clientData.isStarted = true;
        clientData.onStart();
    });

    client.addEventListener("newPos", ({ connId, payload }) => {
        clientData.players = payload;
    });

    client.addEventListener("chat", ({ connId, payload }) => {
        const idx = data.findIndex(chat => chat.id === payload.id);
        if (idx === -1)
            data.push({ id: payload.id });
        data.find(chat => chat.id === payload.id).chat = payload.chat;
    });
    document.getElementById("message").addEventListener("input", (x) => {
        client.send("chat", x.currentTarget.value);
    });
}

function render() {
    const text = data.map(x => `${x.id}: ${x.chat}`).join("\n");
    document.getElementById("messages").value = text;
}
