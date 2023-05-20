import { Entity } from "./entity.js";
import { input, entityType,  playerType, constant } from "../../constant.js";
import { Bullet } from "./bullet.js";
import { serverData } from "../server.js";

export class Player extends Entity {
    constructor(connId, x = 0, y = 0, isPolice = 0, engine) {
        super(Matter.Bodies.circle(x, y, 10));
        this.entityType = entityType.PLAYER;
        this.body.label = entityType.PLAYER;
        this.connId = connId;
        this.speed = 50;
        this.key = {};
        this.engine = engine;
        this.isFire = false;
        this.dx = 0;
        this.dy = 0;
        if (isPolice)
            this.playerType = playerType.POLICE;
        else
            this.playerType = playerType.THIEF;
    }

    update(delta) {
        const isRight = this.key[input.RIGHT];
        const isLeft = this.key[input.LEFT];
        const isDown = this.key[input.DOWN];
        const isUp = this.key[input.UP];
        const sprint = this.key[input.SPRINT] ? 2 : 1;
        const isFire = this.key[input.FIRE] ? 1 : 0;
        const dx = (isRight ? 1 : 0) + (isLeft ? -1 : 0);
        const dy = (isDown ? 1 : 0) + (isUp ? -1 : 0);
        const x = dx * sprint * delta * this.speed;
        const y = dy * sprint * delta * this.speed;
        Matter.Body.setVelocity(this.body, { x, y });
        this.isFire = isFire ? 1 : 0;
        if (dx === 0 && dy === 0)
            return ;
        this.dx = dx;
        this.dy = dy;
    }
    /**
     * @param {Matter.Engine} engine 
     */
    fire(engine){
        if (this.playerType === playerType.THIEF)
            return ;
        console.log("start fire");
        const {x: bx, y: by} = this.body.position;
        const x = bx + (Math.cos(this.body.angle) * 10);
        const y = by + (Math.sin(this.body.angle) * 10);

        const bullet = new Bullet(x, y);
        serverData.entities.push(bullet);
        Matter.Composite.add(engine.world, bullet.body);
        Matter.Body.applyForce(bullet.body, this.body.position, {
            x: this.dx * 0.09,
            y: this.dy * 0.09,
        },);
    }

    damagedByBullet(){
        this.speed = 1;
    }

    recovred(){
        this.speed = 50;
    }

    toDTO() {
        return {
            ...super.toDTO(),
            type: this.entityType,
            connId: this.connId,
            isSprint: this.key[input.SPRINT],
            playerType: this.playerType,
            isFire: this.isFire,
        }
    }
}
