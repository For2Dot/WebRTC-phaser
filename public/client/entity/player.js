import Entity from "./entity.js";
import { constant, entityType, playerType, input} from "../../constant.js";
import { clientData } from "../client.js";

export default class Player extends Entity {
	constructor(meta) {
		super(meta);
		this.entityType = entityType.PLAYER;
		this.playerType = this.meta.playerType;
		this.stamina = this.meta.stamina;
		this.lastFace = input.RIGHT;
		this.playerImage = this.meta.playerType === playerType.POLICE ? "police" : "thief";
		this.images = [
			new Phaser.GameObjects.Image(clientData.scene, 0, 0, this.playerImage),
			new Phaser.GameObjects.Image(clientData.scene, 0, 0, "jail"),
		];
		this.images[0].toggleFlipX();
		this.images[1].setVisible(false);
		if (meta.connId === clientData.connId)
			this.images.push(new Phaser.GameObjects.Image(clientData.scene, 0, 0, "my_bar"));
		this.images.forEach(x => {
			clientData.scene.add.existing(x);
			this.gameObject.add(x);
		});
		this.images[0].setMask(clientData.visionMask);
		this.lastFootprint = Date.now();
		this.lastFire = Date.now();
		if (this.meta.connId == clientData.connId)
		{
			this.images[2].depth = 1;
			this.images[2].scaleY = 0.5;
		}
	}

	static prelodad(scene) {
		scene.load.image("police", '../assets/images/police.png');
		scene.load.image("thief", '../assets/images/thief.png');
		scene.load.image("jail", '../assets/images/jail.png');
		scene.load.image("footprint", '../assets/images/footprint.png');
		scene.load.image("circle", '../assets/images/circle.png');
		scene.load.image("my_bar", '../assets/images/bar.png');
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
	}

	updateMybar()
	{
		if (this.meta.connId !== clientData.connId)
			return;
		this.images[2].x = this.x;
		this.images[2].y = this.y + 16;
		this.images[2].scaleX = this.meta.stamina / constant.maximumStamina;
	}

	updateJail()
	{
		if (this.meta.isImprisoned)
			this.images[1].setVisible(true);
		else
			this.images[1].setVisible(false);
		this.images[1].y = this.y + 8;
	}

	updatePlayerImage(){
		this.images[0].y = this.y + 8;
		if (this.lastFace !== this.meta.lastFace){
			this.images[0].toggleFlipX();
			this.lastFace = this.meta.lastFace;
		}
	}

	update() {
		super.update();
		this.updatePlayerImage();
		this.updateFootprint();
		this.updateFireBulletFx();
		this.updateMybar();
		this.updateJail();
	}
}
