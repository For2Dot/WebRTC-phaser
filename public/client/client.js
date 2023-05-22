import { Client } from "../server/webrtc.js";
import { constant, entityType, playerType } from "../constant.js";
import Entity from "./entity/entity.js";
import Player from "./entity/player.js";
import TestBall from "./entity/testBall.js";
import Wall from "./entity/wall.js";
import Door from "./entity/door.js";

export const clientData = {
    players: [],
    /**
     * @type {Object<number, Entity>}
     */
    entities: {},
    onKeyEvent: null,
    connId: null,
    keyPressed: {},
    isStarted: false,
    /**
     * @type {Phaser.Scene}
     */
    scene: null,
    /**
     * @type {Phaser.Display.Masks.GeometryMask}
     */
    visionMask: null,
    role: playerType.POLICE,
};

/**
 * @param {Entity} entity 
 */
export const addEntity = (entity) => {
    if (entity.entityType === entityType.PLAYER)
        clientData.players.push(entity);
    clientData.entities[entity.meta.id] = entity;
    clientData.scene.add.existing(entity.gameObject);
}

/**
 * @param {Entity} entity 
 */
export const removeEntity = (entity) => {
    if (entity.entityType === entityType.PLAYER)
        clientData.players = clientData.players.filter(x => x.id === entity.id);
    delete clientData.entities[entity.meta.id];
    entity.destroy();
}

export const createEntity = (meta) => {
    let entity = null;
    if (meta == null || meta.type == null)
        throw new Error("meta is not defined");
    else if (meta.type == entityType.PLAYER)
        entity = new Player(meta);
    else if (meta.type == entityType.TESTBALL)
        entity = new TestBall(meta);
    else if (meta.type == entityType.WALL)
        entity = new Wall(meta);
    else if (meta.type == entityType.DOOR)
        entity = new Door(meta);
    else
        throw new Error("entity type is not defined");
    return entity;
}

const chats = [];
/**
 * @param {Client} client 
 */
export default function activity(client) {

    let ping_ms = 0;

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
        client.send("start")
    });

    client.addEventListener("frame", ({ connId, payload }) => {
        const rawEntities = payload.reduce((acc, cur) => {
            acc[cur.id] = cur;
            return acc;
        }, {});
        for (const id in clientData.entities) {
            if (rawEntities[id] == null && clientData.entities[id].meta.type !== entityType.WALL) {
                removeEntity(clientData.entities[id]);
            }
        }
        for (const id in rawEntities) {
            if (clientData.entities[id] == null) {
                addEntity(createEntity(rawEntities[id]));
            }
            clientData.entities[id].setMeta(rawEntities[id]);
        }
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


    client.addEventListener("pong", ({ connId, payload }) => {
        let elapsed_time = Date.now() - ping_ms;
        document.getElementById("ping").innerText = `ping: ${elapsed_time}ms`;
    });

    setInterval(() => {
        ping_ms = Date.now();
        client.send("ping");
    }, 1000);
}

function render() {
    const text = chats.map(x => `${x.id}: ${x.chat}`).join("\n");
    document.getElementById("messages").value = text;
}
