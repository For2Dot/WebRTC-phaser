import { Server } from "./webrtc.js";
import { constant, input } from "../constant.js";

const data = {
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

class Entity {
    /**
     * @param {Matter.Body} body 
     */
    constructor(body) {
        /**
         * @type {Matter.Body}
         */
        this.body = body;
        data.entities.push(this);
    }

    /**
     * @param {number} delta
     */
    update(delta) { }

    /**
     * 
     */
    toDTO() {
        return {
            id: this.body.id,
            x: this.body.position.x,
            y: this.body.position.y,
        }
    }
}

class Player extends Entity {
    constructor(connId, x = 0, y = 0) {
        super(Matter.Bodies.circle(x, y, 10));
        this.connId = connId;
        this.speed = 50;
        this.key = {};
        data.players.push(this);
        data.playerMapByConnId[connId] = this;
    }
    update(delta) {
        const isRight = this.key[input.RIGHT];
        const isLeft = this.key[input.LEFT];
        const isDown = this.key[input.DOWN];
        const isUp = this.key[input.UP];
        const sprint = this.key[input.SPRINT] ? 2 : 1
        const dx = (isRight ? 1 : 0) + (isLeft ? -1 : 0);
        const dy = (isDown ? 1 : 0) + (isUp ? -1 : 0);
        const x = dx * sprint * delta * this.speed;
        const y = dy * sprint * delta * this.speed
        Matter.Body.setVelocity(this.body, { x, y });
    }
    toDTO() {
        return {
            ...super.toDTO(),
            connId: this.connId,
        }
    }
}

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
            Matter.Body.setPosition(player.body, { x, y });
        });
        Matter.Composite.add(engine.world, data.players.map(x => x.body));
        Matter.Runner.run(runner, engine);
    }

    server.addEventListener("chat", ({ connId, payload }) => {
        server.broadcast("chat", { id: connId, chat: payload });
    });

    server.addConnListener((connId, state) => {
        if (state === "connected") {
            server.broadcast("chat", { id: connId, chat: "has joined." });
            const player = new Player(connId, 0, 0);
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
        data.playerMapByConnId[connId].key[key.inputId] = payload.state;
    });

    Matter.Events.on(runner, "beforeUpdate", ({ timestamp, source, name }) => {
        const delta = source.delta * 0.001;
        data.entities.forEach((entity) => entity.update(delta));
    });

    Matter.Events.on(runner, "afterUpdate", ({ timestamp, source, name }) => {
        server.broadcast("newPos", data.players.map(player => player.toDTO()));
    });
}
