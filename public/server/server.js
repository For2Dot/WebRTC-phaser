import { Server } from "./webrtc.js";
import { constant, entityType } from "../constant.js";
import { Entity } from "./entity/entity.js";
import { Player } from "./entity/player.js";
import { TestBall } from "./entity/testBall.js";

export const serverData = {
    /**
     * @type {Object<string, Player>}
     */
    playerMapByConnId: {},
    /**
     * The elements in this array are automatically managed.
     * @type {Array<Player>}
     */
    players: [],
    /**
     * The elements in this array are automatically managed.
     * @type {Array<Entity>}
     */
    entities: [],
};

/**
 * @param {Server} server 
 */
export default function activity(server) {
    const noGravity = { x: 0, y: 0, scale: 0 }
    const engine = Matter.Engine.create({ gravity: noGravity });
    const runner = Matter.Runner.create();

    /**
     * @param {Entity} entity 
     */
    const addEntity = (entity) => {
        serverData.entities.push(entity);
        if (entity.entityType == entityType.PLAYER) {
            serverData.players.push(entity);
            serverData.playerMapByConnId[entity.connId] = entity;
        }
        if (entity.appendToEngine)
            Matter.Composite.add(engine.world, entity.body);
    }

    const removeEntity = (entity) => {
        // TODO
    }

    const init = () => {

        // for test
        for (let i = 0; i < 300; i++) addEntity(new TestBall());


        serverData.players.forEach((player, idx) => {
            const x = idx * 25 + 100;
            const y = 300;
            Matter.Body.setPosition(player.body, { x, y });
        });
        Matter.Composite.add(engine.world, serverData.players.map(x => x.body));
        Matter.Runner.run(runner, engine);
    }

    server.addEventListener("chat", ({ connId, payload }) => {
        server.broadcast("chat", { id: connId, chat: payload });
    });


    server.addEventListener("ping", ({ connId, payload }) => {
        server.send(connId, "pong", { id: connId, chat: payload });
    });

    server.addConnListener((connId, state) => {
        if (state === "connected") {
            server.broadcast("chat", { id: connId, chat: "has joined." });
            addEntity(new Player(connId, 0, 0));
            if (serverData.players.length < constant.playerCnt)
                return;
            const startBtn = document.querySelector("#start");
            startBtn.addEventListener("click", () => {
                server.freezeRoom();
                init();
                setTimeout(() => {
                    server.broadcast("start", constant.playerCnt);
                    server.broadcast("chat", { id: "System", chat: "game started!" });
                }, 100);
                startBtn.style.display = "none";

            });
            startBtn.removeAttribute("disabled");
        }
    });

    server.addEventListener("keyPress", ({ connId, payload }) => {
        const key = constant.keyMap.find(x => x.inputId === payload.inputId);
        if (key == null)
            return;
        serverData.playerMapByConnId[connId].key[key.inputId] = payload.state;
    });

    Matter.Events.on(runner, "beforeUpdate", ({ timestamp, source, name }) => {
        const delta = source.delta * 0.001;
        serverData.entities.forEach((entity) => entity.update(delta));
    });

    Matter.Events.on(runner, "afterUpdate", ({ timestamp, source, name }) => {
        server.broadcast("frame", serverData.entities.map(x => x.toDTO()));
    });
}
