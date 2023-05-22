import { Entity } from "./entity.js";
import { constant, input, entityType } from "../../constant.js";

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

        if (this.key[input.INTERACT])
            this.interact();
        else
        {
            this.body.collided = [];
            Matter.Body.setVelocity(this.body, { x, y });
        }
    }

    toDTO() {
        return {
            ...super.toDTO(),
            y: this.body.position.y - 7,
            type: this.entityType,
            connId: this.connId,
            isSprint: this.key[input.SPRINT],
            isFire: false, // TODO
        }
    }

    interact() {
        if (this.body.collided.length === 0)
            return;
        this.body.collided.forEach(entity => {
            if (entity.entityType === entityType.DOOR)
            {
                console.log(entity.body.id);
                entity.toggle();
            }
        });
        this.key[input.INTERACT] = false;
    }
}
