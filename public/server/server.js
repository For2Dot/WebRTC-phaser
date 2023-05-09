import { Server } from "./webrtc.js";
import { constant } from "../constant.js";
import { Entity } from "./entity/entity.js";
import { Player } from "./entity/player.js";

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

    const init = () => {
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

    server.addConnListener((connId, state) => {
        if (state === "connected") {
            server.broadcast("chat", { id: connId, chat: "has joined." });
            const player = new Player(connId, 0, 0);
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
                // change startBtn's style to display:none
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
        server.broadcast("newPos", serverData.players.map(player => player.toDTO()));
    });
}
