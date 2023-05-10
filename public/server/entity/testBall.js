import { Entity } from "./entity.js";
import { entityType } from "../../constant.js";

export class TestBall extends Entity {
    constructor() {
        const min = 0;
        const max = 500;
        const randomX = Math.floor(Math.random() * (max - min + 1)) + min;
        const randomY = Math.floor(Math.random() * (max - min + 1)) + min;
        super(Matter.Bodies.circle(randomX, randomY, 10));
        this.entityType = entityType.TESTBALL;
    }
}
