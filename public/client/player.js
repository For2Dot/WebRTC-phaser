import clientData from "./data.js";

export default class Player extends Phaser.Physics.Matter.Sprite {
	constructor(data) {
		let { scene, x, y, texture, frame, id } = data;
		super(scene.matter.world, x, y, texture, frame);
		this.id = id;
		this.scene.add.existing(this);

		const { Body, Bodies } = Phaser.Physics.Matter.Matter;
		var playerCollier = Bodies.circle(this.x, this.y, 12, { isSensor: false, laber: 'playerCollider' });
		var playerSensor = Bodies.circle(this.x, this.y, 50, { isSensor: true, laber: 'playerSensor' });
		const compoundbody = Body.create({
			parts: [playerCollier, playerSensor],
			frictionAir: 0.35,
		});
		this.setExistingBody(compoundbody);
		this.setFixedRotation();
	}

	static prelodad(scene) {
		scene.load.atlas('female', '../assets/images/female.png', '../assets/images/female_atlas.json');
	}

	update() {
		const player = clientData.players.find(x => x.id === this.id);
		this.setPosition(player.x, player.y)
	}
}
