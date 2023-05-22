import Entity from "./entity.js";
import { constant, entityType, playerType } from "../../constant.js";
import { clientData } from "../client.js";

export default class Player extends Entity {
	constructor(meta) {
		super(meta);
		this.entityType = entityType.PLAYER;
		this.playerType = this.meta.playerType;
		this.stamina = this.meta.stamina;
		this.images = [
			new Phaser.GameObjects.Image(clientData.scene, 0, 0, "female", "townsfolk_f_idle_1"),
		];
		this.images.forEach(x => {
			clientData.scene.add.existing(x);
			this.gameObject.add(x);
		});
		this.images[0].setMask(clientData.visionMask);
		this.lastFootprint = Date.now();
		this.lastFire = Date.now();
	}

	static prelodad(scene) {
		scene.load.atlas('female', '../assets/images/female.png', '../assets/images/female_atlas.json');
		scene.load.image("footprint", '../assets/images/footprint.png');
		scene.load.image("circle", '../assets/images/circle.png');
		scene.load.image("bullet", '../assets/images/ship.png');
	}

	/**
	 * @returns {Phaser.GameObjects.GameObject}
	 */
	getMainImage() {
		return this.images[0];
	}

	updateFootprint() {
		if (this.meta.isSprint != true)
			return;
		if (Date.now() < this.lastFootprint + constant.footPrintTimeInterval * 1000)
			return;
		if (clientData.role !== playerType.POLICE)
			return;
		this.lastFootprint = Date.now();
		clientData.scene.add.particles(this.x, this.y + 10, "footprint", {
			tint: 0x990000,
			alpha: {start: 1, end: 0},
			duration: constant.footPrintLife * 1000
		});
	}

	updateFireBulletFx() {
		if (clientData.role === playerType.THIEF)
			return;
		if (this.meta.isFire != true)
			return;
		const {x, y} = this;
		const createParticle = () => {
			clientData.scene.add.particles(x, y, "circle", {
				scale: {start: 0, end: 2},
				alpha: {start: 0, end: 0.2},
				duration: 100,
			});
		};
		setTimeout(createParticle, 0);
		setTimeout(createParticle, 400);
		setTimeout(createParticle, 600);
	}

	update() {
		super.update();
		this.updateFootprint();
		this.updateFireBulletFx();
	}
}
