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
		const speed = 2.5;
		let playerVelocity = new Phaser.Math.Vector2();
		const player = clientData.players.find(x => x.id === this.id);
		const dx = player.x - this.x;
		const dy = player.y - this.y;

		if (dx != 0 && Math.abs(dx) > 1)
			playerVelocity.x = dx > 0 ? 1 : -1;
		if (dy != 0 && Math.abs(dy) > 1)
			playerVelocity.y = dy > 0 ? 1 : -1;
		playerVelocity.normalize();
		playerVelocity.scale(speed);
		this.setVelocity(playerVelocity.x, playerVelocity.y);
	}
}