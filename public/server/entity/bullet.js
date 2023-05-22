import { Entity } from "./entity.js";
import { entityType } from "../../constant.js";
import { serverService } from "../server.js";

export class Bullet extends Entity {
    constructor(x = 0, y = 0, dx, dy) {
		super(Matter.Bodies.circle(
            x, y, 4, {
                frictionAir: 0.006,
                density: 0.1,
            },
        ));
		this.body.isSensor = true;
		this.entityType = entityType.BULLET;
		this.body.label = entityType.BULLET;
        Matter.Body.applyForce(this.body, this.body.position, {
            x: dx * 0.09,
            y: dy * 0.09,
        },);
        setTimeout(() => {
            serverService.removeEntity(this);
        }, 1000);
        console.log(this.body.id, this.body);
    }

	collisionEvent(){
		serverService.removeEntity(this);
	}
}
