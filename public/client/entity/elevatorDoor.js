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
            new Phaser.GameObjects.Text(clientData.scene, 0, 0, `Not Allowed`, { color: '#ffffff', fontSize: '13px', backgroundColor: '#000000' }),
        ];
        this.images.forEach(x => {
            clientData.scene.add.existing(x);
            this.gameObject.add(x);
            x.setVisible(false);
        });

        this.images[0].setVisible(true);
        this.images[2].setScale(0.5, 0.5);

        this.images[3].depth = 2;
        this.images[3].setScale(0.5, 0.5);

        this.isOpened = false;
        this.alertType = 0;
    }

    setMeta(meta) {
        super.setMeta(meta);
        this.code = meta.code;
        if (this.isOpened != null && this.isOpened !== meta.isOpened) {
            this.isOpened = meta.isOpened;
            this.toggle();
        }

        if (meta.alertType > 0 && this.alertType !== meta.alertType) {
            this.alertType = meta.alertType;
            if (this.alertType)
                this.showAlert(this.alertType);
        }
    }

    static prelodad(scene) {
        scene.load.image('ev-door-c', '../assets/images/ev-door-c.png');
        scene.load.image('ev-door-o', '../assets/images/ev-door-o.png');
    }

    showText(text) {
    }

    showAlert(alertType) {
        let alertEff;

        if (alertType == 1) {
            this.images[2].setVisible(true);
            alertEff = setInterval(() => {
                this.images[2].setTexture(this.images[2].texture.key === 'gen0' ? 'gen50' : 'gen0');
            }, 100);

        } else if (alertType == 2)
            this.images[3].setVisible(true);

        setTimeout(() => {
            this.alertType = 0;
            this.alertIsOn = false;
            this.images[2].setVisible(false);
            this.images[3].setVisible(false);

            if (alertEff) clearInterval(alertEff);
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
