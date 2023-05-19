import { Entity } from "./entity.js";
import { constant, entityType } from "../../constant.js";

export class Wall extends Entity {
    constructor(x, y, code) {
        super(Matter.Bodies.rectangle(x, y, constant.blockCenter, constant.blockCenter, {isStatic:true}));
        this.entityType = entityType.WALL;
        this.wallCode = code;
        this.isStatic = true;
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: constant.blockCenter,
            height: constant.blockCenter,
        }
    }
}
