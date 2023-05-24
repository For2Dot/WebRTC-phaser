import Entity from "./entity.js";
import { entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Wall extends Entity {
    constructor(meta) {
        super(meta);
        this.entityType = entityType.WALL;
        this.setMeta(meta);
        this.images = [
            new Phaser.GameObjects.Rectangle(clientData.scene, this.meta.x, this.meta.y, this.meta.width, this.meta.height),
        ];
        this.images[0].fillColor = 1;
        this.images[0].setFillStyle(0x000000);
        console.log(this.images[0]);
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
        scene.load.image('wall', '../assets/images/wall.png');
    }
}
