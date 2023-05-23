import Entity from "./entity.js";
import { entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class ElevatorDoor extends Entity {
    constructor(meta) {
        super(meta);
        this.entityType = entityType.DOOR;
        this.setMeta(meta);
        this.images = [
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, 'ev-door-c'),
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, 'ev-door-o'),
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, 'gen0'),
        ];
        this.images.forEach(x => {
            clientData.scene.add.existing(x);
            this.gameObject.add(x);
            x.setVisible(false);
        });
        this.images[0].setVisible(true);
        this.images[2].setScale(0.5, 0.5);

        this.isOpened = false;
        this.alertIsOn = false;
    }

    setMeta(meta) {
        super.setMeta(meta);
        this.code = meta.code;
        if (this.isOpened != null && this.isOpened !== meta.isOpened) {
            this.isOpened = meta.isOpened;
            this.toggle();
        }

        if (meta.alertIsOn && this.alertIsOn !== meta.alertIsOn) {
            this.alertIsOn = meta.alertIsOn;
            if (this.alertIsOn)
                this.showAlert();
        }
    }

    static prelodad(scene) {
        scene.load.image('ev-door-c', '../assets/images/ev-door-c.png');
        scene.load.image('ev-door-o', '../assets/images/ev-door-o.png');
    }

    showAlert() {
        this.images[2].setVisible(true);
        const alertEff = setInterval(() => {
            this.images[2].setTexture(this.images[2].texture.key === 'gen0' ? 'gen50' : 'gen0');
        }, 100);

        setTimeout(() => {
            this.alertIsOn = false;
            this.images[2].setVisible(false);
            clearInterval(alertEff);
        }, 1000);

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
