import { Entity } from "./entity.js";
import { entityType } from "../../constant.js";

export class Bullet extends Entity {
    constructor(x = 0, y = 0) {
		console.log("bullet create");
		super(Matter.Bodies.circle(
            x, y, 4, {
                frictionAir: 0.006,
                density: 0.1,
                render: {fillStyle: "yellow"},
            },
        ));
		this.entityType = entityType.BULLET;
		this.body.label = entityType.BULLET;
    }

	collisionEvent(){
		console.log("collisoin");
	}
}
