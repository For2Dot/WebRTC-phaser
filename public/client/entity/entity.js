import { constant, entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Entity {
    constructor(meta) {
        this.entityType = entityType.ENTITY;
        this.beforeMeta = null;
        this.meta = meta;
        this.gameObject = clientData.scene.add.group();
        this.isInVisionMask = false;
        this.delAction = null;
    }

    getGameObject() {
        return this.gameObject;
    }

    destroy() {
        this.gameObject.destroy(true, true);
    }

    setMeta(meta) {
        this.beforeMeta = this.meta;
        this.meta = meta;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    setPosition(x, y) {
        this.gameObject.setXY(x, y);
    }

    update() {
        let { x, y } = this.meta;
        const dx = this.x - this.meta.x;
        const dy = this.y - this.meta.y;
        if (this.x != null && this.y != null) {
            x = (x * constant.clientLerp + this.x * (1 - constant.clientLerp));
            y = (y * constant.clientLerp + this.y * (1 - constant.clientLerp));
        }
        this.x = x;
        this.y = y;
        this.setPosition(x, y);
        const distance = dx * dx + dy * dy;
        if (this.delAction != null && distance < 10)
            this.delAction();
    }

    deleteLerp(delAction) {
        this.delAction = delAction;
    }
}
