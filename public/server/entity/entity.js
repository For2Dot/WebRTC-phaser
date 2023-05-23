import { entityType } from "../../constant.js";

export class Entity {
    static nextGroupId = -1;
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

    /**
     * @param {Matter.Body} myBody 
     * @param {Matter.Body} targetBody 
     */
    onCollision(myBody, targetBody) {
    }

    /**
     * @returns {number}
     */
    static getNextGroupId() {
        return Entity.nextGroupId--;
    }
}
