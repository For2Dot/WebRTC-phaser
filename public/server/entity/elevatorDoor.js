import { Entity } from "./entity.js";
import { serverService, serverData } from '../server.js';
import { constant, entityType, input, bodyCategory, bodyLabel, playerType } from "../../constant.js";

export class ElevatorDoor extends Entity {
    constructor(x, y, w, h, group) {
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
        this.isStatic = true;
        this.isOpened = false;
        this.lastSwitched = Date.now();
        this.alertType = 0;
        this.group = group;
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

    openDoor(byOther = false) {
        this.body.isSensor = true;
        this.isOpened = true;

        if (byOther)
            return ;

        serverData.entities.filter(x => x.entityType === entityType.EVDOOR && x.group === this.group && x !== this && x.isOpened === false)
            .forEach(x => x.openDoor(true));
    }

    closeDoor(byOther = false) {
        this.body.isSensor = false;
        this.isOpened = false;

        if (byOther)
            return ;

        serverData.entities.filter(x => x.entityType === entityType.EVDOOR && x.group === this.group && x !== this && x.isOpened === true)
            .forEach(x => x.closeDoor(true));
        serverService.rule.checkGameSet(this.group);
        serverService.rule.resetGenerators();
    }

    switchDoor() {
        if (Date.now() - this.lastSwitched < 1000) return;
        if (!serverService.rule.electricity) {
            this.sendAlert(1); // not ready
            return ;
        }

        if (this.isOpened) this.closeDoor();
        else this.openDoor();

        this.lastSwitched = Date.now();
    }

    interact(who) {
        if (who === playerType.THIEF)
            this.switchDoor();
        else if (who === playerType.POLICE)
            this.sendAlert(2); // not allowed
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
            
        if (target.entityType === entityType.PLAYER && target.key[input.INTERACT])
            if (target.playerType === playerType.THIEF)
                if (this.isOpened)
                    target.isEscaped = true;
    };
}
