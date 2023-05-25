import Entity from "./entity.js";
import { entityType, doorType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Door extends Entity {
    constructor(meta) {
        super(meta);
        this.entityType = entityType.DOOR;
        this.setMeta(meta);
        this.images = [
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, 'door-c'),
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, 'door-o'),
        ];
        if (this.meta.doorType === doorType.VERTICAL){
            this.images[0].rotation = 1.5705;
            this.images[1].rotation = 1.5705;
        }
        this.images.forEach(x => {
            clientData.scene.add.existing(x);
            this.gameObject.add(x);
        });
        this.images[1].setVisible(false);
        this.isOpened = false;
    }

    setMeta(meta) {
        super.setMeta(meta);
        this.code = meta.code;
        if (this.isOpened == null)
            return ;
        if (this.isOpened !== meta.isOpened)
        {
            this.isOpened = meta.isOpened;
            this.toggle();
        }
    }

    static prelodad(scene) {
        scene.load.image('door-c', '../assets/images/door-c.png');
        scene.load.image('door-o', '../assets/images/door-o.png');
    }

    toggle() {
        this.gameObject.clear();
        if (this.isOpened) {
            this.images[0].setVisible(false);
            this.images[1].setVisible(true);
        } else {
            this.images[0].setVisible(true);
            this.images[1].setVisible(false);
        }
    }
}
