import { Entity } from "./entity.js";
import { bodyLabel, entityType, playerType } from "../../constant.js";
import { serverData, serverService } from "../server.js";

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
		this.body.label = bodyLabel.BULLET;
        Matter.Body.applyForce(this.body, this.body.position, {
            x: dx * 0.09,
            y: dy * 0.09,
        },);
        setTimeout(() => {
            serverService.removeEntity(this);
        }, 2000);
    }

    /**
     * @param {Matter.Body} myBody 
     * @param {Matter.Body} targetBody 
     */
    onCollision(myBody, targetBody){
        const target = serverData.entityBodyMap[targetBody.id];
        if (target.entityType !== entityType.PLAYER)
            serverService.removeEntity(this);
    }
}
