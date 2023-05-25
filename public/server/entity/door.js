import { Entity } from "./entity.js";
import { constant, entityType, input, bodyCategory, bodyLabel } from "../../constant.js";
import { serverData } from "../server.js";

export class Door extends Entity {
    constructor(x, y, w, h, type) {
        super(Matter.Bodies.rectangle(x, y, w, h,
            {
                isStatic: true,
                collisionFilter: { category: bodyCategory.SENSOR_TARGET }
            },
        ));
        this.width = w;
        this.height = h;
        this.entityType = entityType.DOOR;
        this.body.label = entityType.DOOR;
        this.doorType = type;
        this.isStatic = true;
        this.isOpened = false;
        this.lastSwitched = Date.now();
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: this.width,
            height: this.height,
            isOpened: this.isOpened,
            doorType: this.doorType,
        }
    }

    switchDoor() {
        let timer;
        if (this.isOpened) {
            this.body.isSensor = false;
            this.isOpened = false;
            if (timer)
                clearTimeout(timer);
        } else {
            this.body.isSensor = true;
            this.isOpened = true;

            timer = setTimeout(() => {
                if (Date.now() - this.lastSwitched > 5000)
                {
                    this.body.isSensor = false;
                    this.isOpened = false;
                }
            }, 5000);
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
        if (target.entityType == entityType.PLAYER && !target.isImprisoned && target.key[input.INTERACT] == true)
            this.interact();
    };
}
