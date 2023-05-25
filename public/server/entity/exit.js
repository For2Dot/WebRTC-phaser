import { Entity } from "./entity.js";
import { serverService, serverData } from '../server.js';
import { constant, entityType, input, bodyCategory, bodyLabel, playerType } from "../../constant.js";

export class Exit extends Entity {
    constructor(x, y, w, h, group) {
        super(Matter.Bodies.rectangle(x, y,
            constant.blockCenter,
            constant.blockCenter,
            {
                isStatic: true,
                isSensor: true,
            },
        ));
        this.entityType = entityType.EXIT;
        this.body.label = entityType.EXIT;
        this.alertType = 0;
        this.group = group;
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: constant.blockCenter,
            height: constant.blockCenter,
            alertType: this.alertType,
        }
    }

    addPlayerOnExit(who) {
        if (who.playerType === playerType.THIEF)
            console.log(`theif interacted with exit`);
        else if (who.playerType === playerType.POLICE)
            console.log(`police interacted with exit`);
            // this.sendAlert(2); // not allowed
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
        if (targetBody.label !== bodyLabel.PLAYER)
            return;

        const target = serverData.entityBodyMap[targetBody.id];
        if (target.entityType === entityType.PLAYER)
            this.addPlayerOnExit(target);
    };
}
