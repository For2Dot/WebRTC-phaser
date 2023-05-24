import { Entity } from "./entity.js";
import { constant, entityType } from "../../constant.js";

export class Wall extends Entity {
    constructor(x = 0, y = 0, w = 0, h = 0, tileID = 0) {
        super(Matter.Bodies.rectangle(x, y, w, h, { isStatic: true }));
        this.w = w;
        this.h = h;
        this.code = tileID;
        this.entityType = entityType.WALL;
        this.body.label = entityType.WALL;
        this.isStatic = true;
    }
    
    toDTO() {
        return {
            ...super.toDTO(),
            width: this.w,
            height: this.h,
            code: this.code,
        }
    }
}

