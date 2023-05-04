export default class Ship extends Phaser.GameObjects.Image{
	constructor(data){
		let {scene,x,y,texture,frame} = data;
		super(scene,x,y,texture);
		this.scene.add.existing(this);

		
		// const {Body, Bodies} = Phaser.Physics.Matter.Matter;
		// var playerSensor = Bodies.circle(this.x, this.y, 36, {isSensor:true, laber:'playerSensor'});
		// const compoundbody = Body.create({
		// 	parts:[playerCollier, playerSensor],
		// 	frictionAir: 0.35,
		// });
		// this.setExistingBody(compoundbody);
		// this.setFixedRotation();
	}

	static prelodad(scene){
		scene.load.image('ship', '../assets/images/ship.png');
	}
}