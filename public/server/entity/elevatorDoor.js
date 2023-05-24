import { Entity } from "./entity.js";
import { serverService } from '../server.js';
import { constant, entityType, input } from "../../constant.js";

export class ElevatorDoor extends Entity {
    constructor(x, y, code) {
        super(Matter.Bodies.rectangle(x, y,
            constant.blockCenter,
            constant.blockCenter,
            { isStatic: true },
        ));
        this.entityType = entityType.EVDOOR;
        this.body.label = entityType.EVDOOR;
        this.wallCode = code;
        this.isStatic = true;
        this.isOpened = false;
        this.lastSwitched = Date.now();
        this.alertIsOn = false;
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: constant.blockCenter,
            height: constant.blockCenter,
            isOpened: this.isOpened,
            alertIsOn: this.alertIsOn,
        }
    }

    switchDoor() {
        if (this.isOpened) {
            this.body.isSensor = false;
            this.isOpened = false;
            serverService.rule.resetGenerators();
        } else {
            this.body.isSensor = true;
            this.isOpened = true;
        }
    }

    interact() {
        const now = Date.now();
        if (now - this.lastSwitched > 1000)
        {
            this.switchDoor();
            this.lastSwitched = now;
        }
    }

    notReady() {
        if (this.alertIsOn == true)
            return;
        this.alertIsOn = true;
        setTimeout(()=> {
            this.alertIsOn = false;
        }, 1000)
    }

    onCollision(target) {
        if (target.entityType == entityType.PLAYER && target.key[input.INTERACT])
        {
            if (serverService.rule.electricity == true)
                this.interact();
            else
                this.notReady();
        }
    };
}
