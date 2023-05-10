import { entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Entity {
    constructor() {
        this.entityType = entityType.ENTITY;
        this.beforeMeta = null;
        this.meta = null;
        this.gameObject = clientData.scene.add.group();
    }

    getGameObject() {
        return this.gameObject;
    }

    destroy() { }

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
        this.setPosition(this.meta.x, this.meta.y);
    }
}
