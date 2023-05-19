import { Entity } from "./entity.js";
import { input, entityType } from "../../constant.js";

export class Player extends Entity {
    constructor(connId, x = 0, y = 0) {
        super(Matter.Bodies.circle(x, y, 10));
        this.entityType = entityType.PLAYER;
        this.connId = connId;
        this.speed = 50;
        this.key = {};
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
        const y = dy * sprint * delta * this.speed;
        Matter.Body.setVelocity(this.body, { x, y });
    }

    toDTO() {
        return {
            ...super.toDTO(),
            type: this.entityType,
            connId: this.connId,
            isSprint: this.key[input.SPRINT],
        }
    }
}
