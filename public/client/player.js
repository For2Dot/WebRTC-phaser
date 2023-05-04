export default class Player extends Phaser.Physics.Matter.Sprite {
	constructor(data) {
		let { scene, x, y, texture, frame } = data;
		super(scene.matter.world, x, y, texture, frame);
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
		if (this.inputKeys.left.isDown) {
			playerVelocity.x = -1;
		} else if (this.inputKeys.right.isDown) {
			playerVelocity.x = 1;
		}
		if (this.inputKeys.up.isDown) {
			playerVelocity.y = -1;
		} else if (this.inputKeys.down.isDown) {
			playerVelocity.y = 1;
		}
		playerVelocity.normalize();
		playerVelocity.scale(speed);
		this.setVelocity(playerVelocity.x, playerVelocity.y);
	}
}