import { serverData } from "../server.js";

export class Entity {
    /**
     * @param {Matter.Body} body 
     */
    constructor(body) {
        /**
         * @type {Matter.Body}
         */
        this.body = body;
        serverData.entities.push(this);
    }

    /**
     * @param {number} delta
     */
    update(delta) {
    }

    toDTO() {
        return {
            id: this.body.id,
            x: this.body.position.x,
            y: this.body.position.y,
        }
    }
}
