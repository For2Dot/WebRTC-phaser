import { Entity } from "./entity.js";
import { constant, entityType } from "../../constant.js";

export class Door extends Entity {
    constructor(x, y, code) {
        super(Matter.Bodies.rectangle(x, y, 
                constant.blockCenter, 
                constant.blockCenter,
                { isStatic: true },
        ));
        this.entityType = entityType.DOOR;
        this.wallCode = code;
        this.isStatic = true;
        this.isOpened = false;
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: constant.blockCenter,
            height: constant.blockCenter,
            isOpened: this.isOpened,        
        }
    }

    interact() {
        if (this.isOpened) {
            this.body.isSensor = false;
            this.isOpened = false;
        } else {
            this.body.isSensor = true;
            this.isOpened = true;
        }
    }
}
