import { Entity } from "./entity.js";
import { entityType } from "../../constant.js";

export class Wall extends Entity {
    constructor(x, y, code) {
        super(Matter.Bodies.rectangle(x, y, 16, 16, {isStatic:true}));
        this.entityType = entityType.WALL;
		this.wallCode = code;
		this.isStatic = true;
    }
}
