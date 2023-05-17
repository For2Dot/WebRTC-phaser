import Entity from "./entity.js";
import { entityType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Player extends Entity {
	constructor(meta) {
		super(meta);
		this.entityType = entityType.PLAYER;
		this.images = [
			new Phaser.GameObjects.Image(clientData.scene, 0, 0, "female", "townsfolk_f_idle_1"),
		];
		this.images.forEach(x => {
			clientData.scene.add.existing(x);
			this.gameObject.add(x);
		});
		this.images[0].setMask(clientData.visionMask);
	}

	static prelodad(scene) {
		scene.load.atlas('female', '../assets/images/female.png', '../assets/images/female_atlas.json');
	}

	/**
	 * @returns {Phaser.GameObjects.GameObject}
	 */
	getMainImage() {
		return this.images[0];
	}

	update() {
		super.update();
	}
}
