import { Server } from "./webrtc.js";
import { constant, entityType } from "../constant.js";
import { Entity } from "./entity/entity.js";
import { Player } from "./entity/player.js";
import { Wall } from "./entity/wall.js";
import { Door } from "./entity/door.js";
import { Generator } from "./entity/generator.js";
import { ElevatorDoor } from "./entity/elevatordoor.js";
import { Rule } from "./rule.js";

const tiles = await fetch("/assets/map.json").then(x => x.json());

export const runner = Matter.Runner.create();

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

    /**
     * @type {Object<number, Entity>}
     */
    entityBodyMap: {},
};

export const serverService = {
    addEntity: null,
    removeEntity: null,
    /**
     * @type {Rule}
     */
    rule: null,
}

/**
 * @param {Server} server 
*/
export default function activity(server) {
    const noGravity = { x: 0, y: 0, scale: 0 }
    const engine = Matter.Engine.create({ gravity: noGravity });
    const lastPing = {};
    let updateCounter = 0;

    /**
     * @param {Entity} entity 
     */
    serverService.addEntity = (entity) => {
        if (entity.body == null || entity.body.id == null)
            return;
        serverData.entities.push(entity);
        entity.body.parts.forEach(x => {
            serverData.entityBodyMap[x.id] = entity;
        });
        if (entity.entityType == entityType.PLAYER) {
            serverData.players.push(entity);
            serverData.playerMapByConnId[entity.connId] = entity;
        }
        if (entity.appendToEngine)
            Matter.Composite.add(engine.world, entity.body);
    }

    /**
     * @param {Entity} entity 
     */
    serverService.removeEntity = (entity) => {
        if (serverData.entityBodyMap[entity.body.id] == null)
            return;
        serverData.entities = serverData.entities.filter(x => x.body.id !== entity?.body?.id);
        entity.body.parts.forEach(x => {
            delete serverData.entityBodyMap[x.id];
        });
        if (entity.entityType === entityType.PLAYER) {
            serverData.players = serverData.players.filter(x => x.body.id !== entity?.body?.id);
            delete serverData.playerMapByConnId[entity.connId];
        }
        if (entity.appendToEngine)
            Matter.Composite.remove(engine.world, entity.body);
    }

    const init = () => {

        const refinedMap = tiles.map(r => ({
            x: (r.rect[1].x + r.rect[0].x) * 0.5 * constant.blockCenter,
            y: (r.rect[1].y + r.rect[0].y) * 0.5 * constant.blockCenter,
            width: (r.rect[1].x - r.rect[0].x) * constant.blockCenter,
            height: (r.rect[1].y - r.rect[0].y) * constant.blockCenter,
            label: r.label,
        }));
        refinedMap.filter(x => x.label === "wall")
            .forEach(x => serverService.addEntity(new Wall(x.x, x.y, x.width, x.height)));
        refinedMap.filter(x => x.label === "door")
            .forEach(x => serverService.addEntity(new Door(x.x, x.y, x.width, x.height)));
        refinedMap.filter(x => x.label === "elevator")
            .forEach(x => serverService.addEntity(new ElevatorDoor(x.x, x.y, x.width, x.height)));
        randomPick(refinedMap.filter(x => x.label === "generator"), constant.generatorCnt)
            .forEach(x => serverService.addEntity(new Generator(x.x, x.y, x.width, x.height)));
        const thiefPositions = randomPick(refinedMap.filter(x => x.label === "thief"), constant.playerCnt - 1);
        const policePositions = randomPick(refinedMap.filter(x => x.label === "police"), 1);
        for (const idx in serverData.players) {
            const player = serverData.players[idx];
            if (idx == 0) {
                Matter.Body.setPosition(player.body, {
                    x: policePositions[idx].x,
                    y: policePositions[idx].y,
                });
            } else {
                Matter.Body.setPosition(player.body, {
                    x: thiefPositions[idx - 1].x,
                    y: thiefPositions[idx - 1].y,
                });
            }
        }
        serverService.rule = new Rule();
        Matter.Composite.add(engine.world, serverData.players.map(x => x.body));
        Matter.Runner.run(runner, engine);
    }

    server.addEventListener("chat", ({ connId, payload }) => {
        server.broadcast("chat", { id: connId, chat: payload });
    });

    server.addEventListener("ping", ({ connId, payload }) => {
        lastPing[connId] = Date.now();
        server.send(connId, "pong", { id: connId });
    });

    server.addConnListener((connId, state) => {
        if (state === "connected") {
            server.broadcast("chat", { id: connId, chat: "has joined." });
            if (serverData.players.length === 0)
                serverService.addEntity(new Player(connId, 0, 0, 1));
            else
                serverService.addEntity(new Player(connId, 0, 0, 0));
            lastPing[connId] = null;
            if (serverData.players.length < constant.playerCnt)
                return;
            server.freezeRoom();
            const startBtn = document.querySelector("#start");
            startBtn.addEventListener("click", () => {
                const isAllReady = () => Object.values(lastPing).every(x => x !== null);
                const startPollingFunc = () => {
                    if (isAllReady() === false) {
                        setTimeout(startPollingFunc, 100);
                        return;
                    }
                    init();
                    server.broadcast("start", serverService.rule.startTime);
                    server.broadcast("chat", { id: "System", chat: "game started!" });
                    startBtn.style.display = "none";
                }
                startPollingFunc();
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
        if (serverService.rule.startTime + constant.gameOverTime * 1000 < Date.now())
            serverService.rule.gameOver();

        const delta = source.delta * 0.001;
        serverData.entities.forEach((entity) => entity.update(delta));
    });

    Matter.Events.on(runner, "afterUpdate", ({ timestamp, source, name }) => {
        if (updateCounter++ === 0) {
            server.broadcast("frame", serverData.entities.map(x => x.toDTO()));
            return;
        }
        if (updateCounter % 2 !== 0)
            return;
        server.broadcast("frame", serverData.entities
            .filter(x => x.entityType !== entityType.WALL)
            .map(x => x.toDTO()));
    });

    Matter.Events.on(engine, "collisionStart", (event) => {
        event.pairs.forEach(x => {
            if (serverData.entityBodyMap[x.bodyA.id] != null && (x.bodyA.collisionFilter.mask & x.bodyB.collisionFilter.category) > 0)
                serverData.entityBodyMap[x.bodyA.id].onCollision(x.bodyA, x.bodyB);
            if (serverData.entityBodyMap[x.bodyB.id] != null && (x.bodyB.collisionFilter.mask & x.bodyA.collisionFilter.category) > 0)
                serverData.entityBodyMap[x.bodyB.id].onCollision(x.bodyB, x.bodyA);
        });
    });

}

/**
 * @param {[]} arr 
 * @param {number} cnt 
 */
function randomPick(arr, cnt) {
    if (arr.length <= cnt)
        return arr.slice(0);
    arr.sort(() => Math.random() - 0.5);
    return arr.slice(0, cnt);
}
