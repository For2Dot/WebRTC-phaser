import Player from "./player.js";
import Ship from "./ship.js";

export default class BootScene extends Phaser.Scene {
	constructor() {
		super("BootScene");
	}

	preload(){
		Player.prelodad(this);
		Ship.prelodad(this);
	}

	create() {
		let {width, height} = this.game.canvas;
		this.player = new Player({scene:this, x:20, y:20,texture:'female', frame:'townsfolk_f_idle_1'});
		this.ship = new Ship({scene:this, x:150, y:150, texture:'ship'});
		this.textplater = new Player({scene:this, x:120, y:120,texture:'female', frame:'townsfolk_f_idle_1'});
		this.player.inputKeys = this.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
		});	
		this.cameras.main.setBounds(0, 0, width * 2, height * 2);
		this.cameras.main.startFollow(this.player);
	}

	update(){
		this.player.update();
	}
}