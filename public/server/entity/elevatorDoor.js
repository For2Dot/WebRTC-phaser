import { Entity } from "./entity.js";
import { serverService, serverData } from '../server.js';
import { constant, entityType, input, bodyCategory, bodyLabel, playerType } from "../../constant.js";

export class ElevatorDoor extends Entity {
    constructor(x, y, code) {
        super(Matter.Bodies.rectangle(x, y,
            constant.blockCenter,
            constant.blockCenter,
            {
                isStatic: true,
                collisionFilter: { category: bodyCategory.SENSOR_TARGET }
            },
        ));
        this.entityType = entityType.EVDOOR;
        this.body.label = entityType.EVDOOR;
        this.wallCode = code;
        this.isStatic = true;
        this.isOpened = false;
        this.lastSwitched = Date.now();
        this.alertType = 0;
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: constant.blockCenter,
            height: constant.blockCenter,
            isOpened: this.isOpened,
            alertType: this.alertType,
        }
    }

    switchDoor() {
        if (Date.now() - this.lastSwitched < 1000) return;
        if (!serverService.rule.electricity) {
            this.sendAlert(1); // not ready
            return ;
        }
        if (this.isOpened) {
            this.body.isSensor = false;
            this.isOpened = false;
            serverService.rule.resetGenerators();
        } else {
            this.body.isSensor = true;
            this.isOpened = true;
        }
        this.lastSwitched = Date.now();
    }

    interact(who) {
        if (who === playerType.THIEF)
            this.switchDoor();
        else if (who === playerType.POLICE)
        {
            this.sendAlert(2); // not allowed
        }
    }

    sendAlert(alert) {
        if (this.alertType > 0)
            return;
        this.alertType = alert;
        setTimeout(() => {
            this.alertType = 0;
        }, 1000)
    }

    onCollision(myBody, targetBody) {
        if (targetBody.label !== bodyLabel.PLAYER_SENSOR)
            return;

        const target = serverData.entityBodyMap[targetBody.id];
        if (target.entityType === entityType.PLAYER && target.key[input.INTERACT])
            this.interact(target.playerType);
    };
}
