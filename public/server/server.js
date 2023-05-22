import { Server } from "./webrtc.js";
import { constant, entityType, playerType, input } from "../constant.js";
import { Entity } from "./entity/entity.js";
import { Player } from "./entity/player.js";
import { TestBall } from "./entity/testBall.js";
import { Bullet } from "./entity/bullet.js";
import { Wall} from "./entity/wall.js";
import { Door} from "./entity/door.js";
import { Generator } from "./entity/generator.js";

const tiles = await fetch("/assets/images/testmap.json")
    .then(x => x.json());

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

export const serverService = {
    count: 1,
    addEntity: null,
    removeEntity: null,
}

/**
 * @param {Server} server 
*/
export default function activity(server) {
    const noGravity = { x: 0, y: 0, scale: 0 }
    const engine = Matter.Engine.create({ gravity: noGravity });
    const runner = Matter.Runner.create();
    const lastPing = {};
    let updateCounter = 0;
    
    /**
     * @param {Entity} entity 
     */
    serverService.addEntity = (entity) => {
        serverData.entities.push(entity);
        if (entity.entityType == entityType.PLAYER) {
            serverData.players.push(entity);
            serverData.playerMapByConnId[entity.connId] = entity;
            // Matter.Composite.add(engine.world, entity.sensor);
        }
        if (entity.appendToEngine)
            Matter.Composite.add(engine.world, entity.body);
    }
    

    /**
     * @param {Entity} entity 
     */
    serverService.removeEntity = (entity) => {
        if (serverData.entities.find(x => x === entity) == null)
            return;
        else if (entity.entityType !== entityType.BULLET)
            return ;
        serverData.entities = serverData.entities.filter(x => x.body.id !== entity?.body?.id);
        if (entity.entityType === entityType.PLAYER) {
            serverData.players = serverData.entities.filter(x => x.body.id !== entity?.body?.id);
            delete serverData.playerMapByConnId[entity.connId];
        }
        if (entity.appendToEngine)
            Matter.Composite.remove(engine.world, entity.body);
        ++serverService.count;
    }

    const init = () => {

        const targetLayer = tiles.layers[1]; 
        const { width, height } = targetLayer;
        for (let y = 0; y < height; ++y){
            for (let x = 0; x < width; ++x){
                const tileId = targetLayer.data[x + y * width];

                if (tileId === 1)
                    serverService.addEntity(new Wall(constant.blockCenter + (x * constant.blockCenter), constant.blockCenter + (y * constant.blockCenter), tileId));
                else if (tileId === 2)
                    serverService.addEntity(new Door(constant.blockCenter + (x * constant.blockCenter), constant.blockCenter + (y * constant.blockCenter), tileId));
                else if (tileId === 3)
                    serverService.addEntity(new Generator(constant.blockCenter + (x * constant.blockCenter), constant.blockCenter + (y * constant.blockCenter), tileId));
            }
        }


        serverData.players.forEach((player, idx) => {

            const x = idx * 25 + 100;
            const y = 100;
          
            Matter.Body.setPosition(player.body, { x, y });
        });
        Matter.Composite.add(engine.world, serverData.players.map(x => x.body));
        Matter.Runner.run(runner, engine);
    }

    server.addEventListener("chat", ({ connId, payload }) => {
        server.broadcast("chat", { id: connId, chat: payload });
    });


    server.addEventListener("ping", ({ connId, payload }) => {
        lastPing[connId] = Date();
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
                    server.broadcast("start", constant.playerCnt);
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
        const delta = source.delta * 0.001;
        serverData.entities.forEach((entity) => entity.update(delta));
    });

    Matter.Events.on(runner, "afterUpdate", ({ timestamp, source, name }) => {
        if (updateCounter === 0){
            server.broadcast("frame", serverData.entities.map(x => x.toDTO()));
            ++updateCounter;
        }
        else{
            server.broadcast("frame", serverData.entities
                .filter(x => x.entityType !== entityType.WALL)
                .map(x => x.toDTO()));
        }
    });
    

    Matter.Events.on(engine, 'collisionStart', function(event) {
        const pairs = event.pairs;

        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            const bodyA = serverData.entities[pair.bodyA.id - 1];
            const bodyB = serverData.entities[pair.bodyB.id - 1];

            if (bodyA.entityType === entityType.PLAYER && bodyB.entityType !== entityType.WALL)
            {
                if (bodyA.body.collided.find(x => x.body.id === bodyB.body.id) == null)
                {
                    bodyA.body.collided.push(bodyB);
                }
            }
        }
    });
  
      Matter.Events.on(engine, "collisionStart", (event) =>{
        console.log("Start collision");
        event.pairs.forEach(x => {
            const ai = x.bodyA.id;
            const bi = x.bodyB.id;
            if (x.bodyA.label === entityType.BULLET){
                if (x.bodyB.label !== playerType.POLICE)
                    serverService.removeEntity(serverData.entities[ai - serverService.count]);
                if (x.bodyB.label === playerType.THIEF)
                    serverData.entities[bi - 1].slowTime = 1;
            }
            else if (x.bodyB.label === entityType.BULLET){
                if (x.bodyA.label !== playerType.POLICE)
                    serverService.removeEntity(serverData.entities[bi - serverService.count]);
                if (x.bodyA.label === playerType.THIEF)
                    serverData.entities[ai - 1].slowTime = 1; 
            }
          
            const bodyA = serverData.entities[ai - serverService.count];
            const bodyB = serverData.entities[bi - serverService.count];

            if (bodyA.entityType === entityType.PLAYER && bodyB.entityType !== entityType.WALL)
                if (bodyA.body.collided.find(x => x.body.id === bodyB.body.id) == null)
                    bodyA.body.collided.push(bodyB);
            
        });
    });
    
}
