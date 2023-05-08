import { Server } from "./webrtc.js";
import constant from "../constant.js";

const data = {
    /**
     * @typedef {Object} PlayerInput
     * @property {number} id
     * @property {string} connId
     * @property {Object<string, boolean>} key
     */

    /**
     * @type {Object<string, PlayerInput>}
     */
    playerInput: {},
    players: [],
    objs: [],
};

/**
 * @param {Server} server 
 */
export default function activity(server) {
    const noGravity = { x: 0, y: 0, scale: 0 }
    const engine = Matter.Engine.create({ gravity: noGravity });
    const runner = Matter.Runner.create();

    const init = () => {
        data.players.forEach((player, idx) => {
            const x = idx * 25 + 100;
            const y = 300;
            Matter.Body.setPosition(player, { x, y });
            data.playerInput[player.connId] = {
                id: player.id,
                connId: player.connId,
                key: {},
            }
        });
        Matter.Composite.add(engine.world, data.players);
        Matter.Runner.run(runner, engine);
    }

    server.addEventListener("chat", ({ connId, payload }) => {
        server.broadcast("chat", { id: connId, chat: payload });
    });

    server.addConnListener((connId, state) => {
        if (state === "connected") {
            server.broadcast("chat", { id: connId, chat: "has joined." });
            const player = Matter.Bodies.circle(0, 0, 10, { connId });
            data.players.push(player);
            if (data.players.length < constant.playerCnt)
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
        data.playerInput[connId].key[key.inputId] = payload.state;
    });

    Matter.Events.on(runner, "beforeUpdate", ({ timestamp, source, name }) => {
        data.players.map(player => {
            const isRight = data.playerInput[player.connId].key["right"];
            const isLeft = data.playerInput[player.connId].key["left"];
            const x = (isRight ? 1 : 0) + (isLeft ? -1 : 0);
            const isDown = data.playerInput[player.connId].key["down"];
            const isUp = data.playerInput[player.connId].key["up"];
            const y = (isDown ? 1 : 0) + (isUp ? -1 : 0);
            const speed = data.playerInput[player.connId].key["sprint"] ? 2 : 1
            Matter.Body.setVelocity(player, { x: x * speed, y: y * speed });
        });
    });

    Matter.Events.on(runner, "afterUpdate", ({ timestamp, source, name }) => {
        server.broadcast("newPos", data.players.map(player => ({
            id: player.connId,
            x: player.position.x,
            y: player.position.y,
        })));
    });
}
