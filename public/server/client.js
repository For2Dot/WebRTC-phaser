import { Client } from "./webrtc.js";
import clientData from "./../client/data.js";
import { constant } from "../constant.js";


const chats = [];
/**
 * @param {Client} client 
 */
export default function activity(client) {
    setInterval(render, 50);
    clientData.onKeyEvent = (keyData) => {
        if (keyData != null)
            client.send("keyPress", keyData);
    };

    // if the browser tab focus is changed, send keyup event to server
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && clientData.isStarted == true) {
            clientData.keyPressed = {};
            constant.keyMap.forEach(x => {
                client.send("keyPress", { ...x, state: false });
            });
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
        const idx = chats.findIndex(chat => chat.id === payload.id);
        if (idx === -1)
            chats.push({ id: payload.id });
        chats.find(chat => chat.id === payload.id).chat = payload.chat;
    });

    document.getElementById("message").addEventListener("input", (x) => {
        client.send("chat", x.currentTarget.value);
    });
}

function render() {
    const text = chats.map(x => `${x.id}: ${x.chat}`).join("\n");
    document.getElementById("messages").value = text;
}
