import Entity from "./entity.js";
import { entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class TestBall extends Entity {
    constructor() {
        super();
        this.entityType = entityType.ENTITY;
        this.images = [
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, "ship"),
        ];
        this.images.forEach(x => {
            clientData.scene.add.existing(x);
            this.gameObject.add(x);
        });
    }

    static prelodad(scene) {
        scene.load.image('ship', '../assets/images/ship.png');
    }

}
