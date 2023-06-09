import Entity from "./entity.js";
import { entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Generator extends Entity {
    constructor(meta) {
        super(meta);
        this.entityType = entityType.GENERATOR;
        this.setMeta(meta);
        this.images = [
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, 'gen0'),
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, 'gen50'),
            new Phaser.GameObjects.Image(clientData.scene, 0, 0, 'gen100'),
            new Phaser.GameObjects.Text(clientData.scene, 0, 0, ``, { color: '#ffffff', fontSize: '13px', backgroundColor: '#000000' }),
        ];
        this.images.forEach(x => {
            clientData.scene.add.existing(x);
            this.gameObject.add(x);
            x.setMask(clientData.visionMask);
            x.setVisible(false);
        });
        this.images[0].setVisible(true);
        this.images[3].depth = 2;
        this.images[3].setScale(0.5, 0.5);

        this.progressRate = 0;
        this.lastBlinked = Date.now();
        this.alertType = 0;
    }

    setMeta(meta) {
        super.setMeta(meta);
        this.code = meta.code;
        if (this.progressRate == null)
            return;
        if (this.progressRate != meta.progressRate) {
            this.progressRate = meta.progressRate;
            this.toggleImage();
        }

        if (meta.alertType > 0 && this.alertType !== meta.alertType) {
            this.alertType = meta.alertType;
            if (this.alertType)
                this.showAlert(this.alertType);
        }
    }

    showAlert(alertType) {
        this.images[3].setText(`Not Allowed`);
        this.images[3].setVisible(true);
        setTimeout(() => {
            this.images[3].setVisible(false);
            this.alertType = 0;
        }, 1000);
    }

    static prelodad(scene) {
        scene.load.image('gen0', '../assets/images/gen0.png');
        scene.load.image('gen50', '../assets/images/gen50.png');
        scene.load.image('gen100', '../assets/images/gen100.png');
    }

    blink(image, progressRate) {
        const now = Date.now();
        const duration = 700 - progressRate * 5;

        if (now - this.lastBlinked < duration)
            return;
        this.lastBlinked = now;
        image.setVisible(true);
        setTimeout(() => {
            image.setVisible(false);
        }, duration / 2);
    }

    toggleImage() {
        this.gameObject.clear();
        if (this.progressRate <= 0) {
            this.images[0].setVisible(true);
            this.images[1].setVisible(false);
            this.images[2].setVisible(false);
            this.images[3].setVisible(false);
        } else if (this.progressRate > 0 && this.progressRate < 100) {
            this.images[3].setVisible(true);
            this.blink(this.images[1], this.progressRate);
        }
        else if (this.progressRate >= 100) {
            this.progressRate = 100;
            this.images[0].setVisible(false);
            this.images[1].setVisible(false);
            this.images[2].setVisible(true);
            this.images[3].setVisible(false);
        }
        // update percentage text
        this.images[3].text = `${this.progressRate}%`;
        this.images[3].x = this.x - 4;
        this.images[3].y = this.y - 10;
    }

}
