import Entity from "./entity.js";
import { entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Bullet extends Entity {
    constructor(meta) {
        super(meta);
        this.entityType = entityType.BULLET;
        this.images = [
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, "bullet"),
        ];
        this.images.forEach(x => {
            clientData.scene.add.existing(x);
            this.gameObject.add(x);
        });
        this.images[0].setMask(clientData.visionMask);
    }

    static prelodad(scene) {
        scene.load.image('bullet', '../assets/images/bullet.png');
    }
}
