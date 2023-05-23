import { Entity } from "./entity.js";
import { constant, entityType, input, bodyCategory, bodyLabel } from "../../constant.js";
import { serverData } from "../server.js";

export class Door extends Entity {
    constructor(x, y, code) {
        super(Matter.Bodies.rectangle(x, y,
            constant.blockCenter,
            constant.blockCenter,
            {
                isStatic: true,
                collisionFilter: { category: bodyCategory.SENSOR_TARGET }
            },
        ));
        this.entityType = entityType.DOOR;
        this.body.label = entityType.DOOR;
        this.wallCode = code;
        this.isStatic = true;
        this.isOpened = false;
        this.lastSwitched = Date.now();
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: constant.blockCenter,
            height: constant.blockCenter,
            isOpened: this.isOpened,
        }
    }

    switchDoor() {
        if (this.isOpened) {
            this.body.isSensor = false;
            this.isOpened = false;
        } else {
            this.body.isSensor = true;
            this.isOpened = true;
        }
    }

    interact() {
        const now = Date.now();
        if (now - this.lastSwitched > 500) {
            this.switchDoor();
            this.lastSwitched = now;
        }
    }

    /**
     * @param {Matter.Body} myBody 
     * @param {Matter.Body} targetBody 
     */
    onCollision(myBody, targetBody) {
        if (targetBody.label !== bodyLabel.PLAYER_SENSOR)
            return;
        const target = serverData.entityBodyMap[targetBody.id];
        if (target.entityType == entityType.PLAYER && target.key[input.INTERACT] == true)
            this.interact();
    };
}
