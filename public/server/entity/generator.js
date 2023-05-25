import { Entity } from "./entity.js";
import { bodyCategory, bodyLabel, constant, entityType, input, playerType } from "../../constant.js";
import { serverData, serverService } from "../server.js";

export class Generator extends Entity {
    constructor(x, y, code) {
        super(Matter.Bodies.rectangle(x, y, constant.blockCenter, constant.blockCenter, {
            isStatic: true, collisionFilter: {
                category: bodyCategory.SENSOR_TARGET,
            }
        }));
        this.entityType = entityType.GENERATOR;
        this.body.label = entityType.GENERATOR;
        this.wallCode = code;
        this.isStatic = true;
        this.genProcess = 0;
        this.genSpeed = 0;
        this.progressRate = 0;
        this.lastSwitched = Date.now();
        this.isWorking = false;
        this.alertType = 0;
        this.generate();
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: constant.blockCenter,
            height: constant.blockCenter,
            progressRate: this.progressRate,
            alertType: this.alertType,
        }
    }

    reset() {
        this.genProcess = 0;
        this.genSpeed = 0;
        this.progressRate = 0;
        this.lastSwitched = Date.now();
        this.isWorking = false;
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

    interact(who) {
        if (this.isWorking == true)
            return;
        if (who === playerType.THIEF) {

            if (Date.now() - this.lastSwitched > 100) {

                if (this.genSpeed < 20)
                    this.genSpeed += 1;
                this.genProcess += 10;

                if (this.genProcess >= 1000) {
                    this.isWorking = true;
                    this.genProcess = 1000;
                    serverService.rule.checkGenerator();
                }
                this.lastSwitched = Date.now();
            }
        } else if (who === playerType.POLICE) {
            this.alertType = 1;
            setTimeout(() => {
                this.alertType = 0;
            }, 1000);
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
            this.interact(target.playerType);
        if (target.entityType == entityType.PLAYER && target.key[input.INTERACT] == false)
            this.genSpeed = 0;
    };
}
