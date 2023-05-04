import Player from "./player.js";
import { client } from "../server/app.js";
import clientData from "./data.js";

export default class BootScene extends Phaser.Scene {
	constructor() {
		super("BootScene");
		this.keyState = {}
	}

	preload() {
		Player.prelodad(this);
		// Ship.prelodad(this);
	}

	create() {
		let { width, height } = this.game.canvas;

		this.players = clientData.players.map(player => {
			return new Player({
				scene: this,
				x: player.x,
				y: player.y,
				texture: 'female',
				frame: 'townsfolk_f_idle_1',
				id: player.id,
			});
		});
		const mine = this.players.find(x => x.id === clientData.connId);
		this.cameras.main.setBounds(0, 0, width * 2, height * 2);
		this.cameras.main.startFollow(mine);
	}

	update() {
		this.players.forEach(player => player.update());
		this.input.keyboard.on('keydown', (event) => {
			if (clientData.onKeyEvent !== null && this.keyState[event.key] != true) {
				this.keyState[event.key] = true;
				const keyData =
					event.key === 'd' ? { inputId: 'right', state: true } :
					event.key === 's' ? { inputId: 'down', state: true } :
					event.key === 'a' ? { inputId: 'left', state: true } :
					event.key === 'w' ? { inputId: 'up', state: true } :
					null;
				clientData.onKeyEvent(keyData);
			}
		});
		this.input.keyboard.on('keyup', (event) => {
			if (clientData.onKeyEvent !== null && this.keyState[event.key] == true) {
				this.keyState[event.key] = false;
				const keyData =
					event.key === 'd' ? { inputId: 'right', state: false } :
					event.key === 's' ? { inputId: 'down', state: false } :
					event.key === 'a' ? { inputId: 'left', state: false } :
					event.key === 'w' ? { inputId: 'up', state: false } :
					null;
				clientData.onKeyEvent(keyData);
			}
		});
	}
}
