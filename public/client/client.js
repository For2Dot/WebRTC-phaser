import { Client } from "../server/webrtc.js";
import { constant, entityType, gameResultType, playerType } from "../constant.js";
import Entity from "./entity/entity.js";
import Player from "./entity/player.js";
import Wall from "./entity/wall.js";
import Door from "./entity/door.js";
import Generator from "./entity/generator.js";
import Bullet from "./entity/bullet.js";
import ElevatorDoor from "./entity/elevatorDoor.js";

export const clientData = {
    players: [],
    generators: [],
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
    entity.deleteLerp(() => {
        if (entity.entityType === entityType.PLAYER)
            clientData.players = clientData.players.filter(x => x.id === entity.id);
        delete clientData.entities[entity.meta.id];
        entity.destroy();
    });
}

export const createEntity = (meta) => {
    let entity = null;
    if (meta == null || meta.type == null)
        throw new Error("meta is not defined");
    else if (meta.type == entityType.PLAYER)
        entity = new Player(meta);
    else if (meta.type == entityType.WALL)
        entity = new Wall(meta);
    else if (meta.type == entityType.DOOR)
        entity = new Door(meta);
    else if (meta.type == entityType.EVDOOR)
        entity = new ElevatorDoor(meta);
    else if (meta.type == entityType.GENERATOR)
        entity = new Generator(meta);
    else if (meta.type == entityType.BULLET)
        entity = new Bullet(meta);
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
    let startTime = null;

    clientData.onKeyEvent = (keyData) => {
        if (document.querySelector("#message:focus") != null)
            return;
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
        startTime = payload;
        client.send("start");

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
        const { id, chat } = payload;
        const textarea = document.getElementById("messages");
        const newChat = document.createElement("p");
        newChat.innerText = `${id}: ${chat}`;
        textarea.appendChild(newChat);
        textarea.scrollTop = textarea.scrollHeight;
    });

    client.addEventListener("end", ({ connId, payload }) => {
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
        const me = clientData.players.find(x => x.meta.connId === clientData.connId);
        setTimeout(() => {
            if (me != null) {
                const win = me.meta.gameResultType === gameResultType.WIN;
                alert("You " + (win ? "win" : "lose"));
                window.history.back();
            }
        }, 1000);

    });

    document.addEventListener('keyup', function(event) {
        if (event.key != "Enter")
            return;
        let focusedInput = document.querySelector("#message:focus");
        if (focusedInput != null) {
            focusedInput.blur();
            if (focusedInput.value != "")
                client.send("chat", focusedInput.value);
            focusedInput.value = "";
        } else {
            Object.keys(clientData.keyPressed)
                .filter(key => clientData.keyPressed[key])
                .forEach(key => {
                    clientData.keyPressed[key] = false;
                    const pressedKey = constant.keyMap.find(x => x.key === key);
                    client.send("keyPress", { ...pressedKey, state: false });
                })
            document.getElementById("message").focus();
        }
    });


    client.addEventListener("pong", ({ connId, payload }) => {
        let elapsed_time = Date.now() - ping_ms;
        document.getElementById("ping").innerText = `ping: ${elapsed_time}ms`;
    });

    setInterval(() => {
        ping_ms = Date.now();
        client.send("ping");
        if (clientData.isStarted) {
            let leftTime = (startTime + constant.gameOverTime * 1000) - Date.now();
            leftTime = leftTime < 0 ? 0 : leftTime;
            leftTime *= 0.001;
            document.getElementById("left-time").innerText = 
                `⏳ ${Math.floor(leftTime / 60)}:${Math.floor(leftTime % 60) < 10 ? "0" : ""}${Math.floor(leftTime % 60)}`;

            if (leftTime < 30)
                // change color of left-time
                document.getElementById("left-time").style.color = "red";
            gameProgressCounter();
        }
    }, 1000);
}

function gameProgressCounter() {
    const gen_counter = document.querySelector(`#generators`);
    const imprisoned_counter = document.querySelector(`#imprisoned`);

    if (!gen_counter.children.length) {
        clientData.generators = Object.values(clientData.entities).filter(x => x.meta.type === entityType.GENERATOR);
        clientData.generators
            .forEach((x, i) => {
                const genImg = document.createElement("img");
                genImg.src = "../assets/images/gen0.png";
                gen_counter.appendChild(genImg);
            });
    } else {
        clientData.generators
            .forEach((x, i) => {
                if (x.meta.progressRate >= 100)
                    gen_counter.children[i].src = "../assets/images/gen100.png";
                else if (x.meta.progressRate > 0 && x.meta.progressRate < 100)
                    gen_counter.children[i].src = "../assets/images/gen50.png";
                else
                    gen_counter.children[i].src = "../assets/images/gen0.png";
            });
    }

    if (!imprisoned_counter.children.length) {
        clientData.players
            .filter(x => x.meta.playerType === playerType.THIEF)
            .forEach((x, i) => {
                const circleImg = document.createElement("img");
                circleImg.src = "../assets/images/circle.png";
                imprisoned_counter.appendChild(circleImg);
            });
    } else {
        clientData.players
            .filter(x => x.meta.playerType === playerType.THIEF)
            .forEach((x, i) => {
                if (x.meta.isImprisoned)
                    imprisoned_counter.children[i].src = "../assets/images/jail.png";
                else
                    imprisoned_counter.children[i].src = "../assets/images/circle.png";
            });
    }

}
