import Entity from "./entity.js";
import { entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Exit extends Entity {
    constructor(meta) {
        super(meta);
        this.entityType = entityType.DOOR;
        this.setMeta(meta);
        this.images = [
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, 'door-o'),
        ];
        this.images.forEach(x => {
            clientData.scene.add.existing(x);
            this.gameObject.add(x);
        });
    }

    // setMeta(meta) {
    //     super.setMeta(meta);
    //     this.code = meta.code;
    // }

    static prelodad(scene) {
        // scene.load.image('door-o', '../assets/images/door-o.png');
    }
}
