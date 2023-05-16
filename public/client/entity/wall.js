import Entity from "./entity.js";
import { entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Wall extends Entity {
    constructor(meta) {
        super(meta);
        this.entityType = entityType.ENTITY;
        this.setMeta(meta);
        this.images = [
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, "ship"),
        ];
        this.images.forEach(x => {
            clientData.scene.add.existing(x);
            this.gameObject.add(x);
        });

    }

    setMeta(meta) {
        super.setMeta(meta);
        this.code = meta.code;
    }

    static prelodad(scene) {
        scene.load.image('ship', '../assets/images/ship.png');
    }
}
