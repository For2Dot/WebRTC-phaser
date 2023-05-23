import { Entity } from "./entity.js";
import { constant, entityType } from "../../constant.js";

export class Generator extends Entity {
    constructor(x, y, code) {
        super(Matter.Bodies.rectangle(x, y, constant.blockCenter, constant.blockCenter, { isStatic: true }));
        this.entityType = entityType.GENERATOR;
        this.body.label = entityType.GENERATOR;
        this.wallCode = code;
        this.isStatic = true;
        this.genProcess = 0;
        this.genSpeed = 0;
        this.progressRate = 0;
        this.lastSwitched = Date.now();
        this.isWorking = false;
        this.generate();
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: constant.blockCenter,
            height: constant.blockCenter,
            progressRate: this.progressRate,
        }
    }

    generate() {

        setInterval(() => {

            if (this.genSpeed == 0 && this.genProcess > 0 && this.genProcess < 1000)
                this.genProcess -= 10;
            else if (this.genSpeed > 0 && this.genProcess < 1000)
                this.genProcess += this.genSpeed;

            if (this.genSpeed > 0)
                this.genSpeed -= 1;

            if (this.genProcess < 0)
                this.genProcess = 0;

            this.progressRate = (this.genProcess / 10).toFixed(0);

        }, 200);
    }

    interact() {
        if (this.genProcess >= 1000)
            return;

        const now = Date.now();
        if (now - this.lastSwitched > 100) {

            if (this.genSpeed < 20)
                this.genSpeed += 1;
            this.genProcess += 1;

            if (this.genProcess >= 1000) {
                this.isWorking = true;
                this.genProcess = 1000;
            }
            this.lastSwitched = now;
        }
    }
}
