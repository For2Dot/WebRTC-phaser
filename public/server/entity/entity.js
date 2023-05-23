import { entityType } from "../../constant.js";

export class Entity {
    /**
     * @param {Matter.Body} body 
     */
    constructor(body) {
        /**
         * @type {Matter.Body}
         */
        this.body = body;
        this.entityType = entityType.ENTITY;
        this.appendToEngine = true;
        this.isStatic = false;
        this.onCollision = null;
    }

    /**
     * @param {number} delta
     */
    update(delta) {
    }

    toDTO() {
        return {
            type: this.entityType,
            id: this.body.id,
            x: this.body.position.x,
            y: this.body.position.y,
            isStatic: this.isStatic,
        }
    }
}
