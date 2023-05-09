import Player from "./player.js";
import clientData from "./data.js";
import { constant } from "../constant.js";

export default class BootScene extends Phaser.Scene {
	constructor() {
		super("BootScene");
		this.keyState = {};
	}

	preload() {
		Player.prelodad(this);
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
				connId: player.connId,
			});
		});
		const mine = this.players.find(x => x.connId === clientData.connId);
		this.cameras.main.setBounds(0, 0, width * 2, height * 2);
		this.cameras.main.startFollow(mine);
	}

	update() {
		this.players.forEach(player => player.update());
		this.input.keyboard.on('keydown', (event) => {
			const key = event.key?.toLowerCase();
			if (clientData.onKeyEvent === null)
				return;
			if (clientData.keyPressed[key] === true)
				return;
			clientData.keyPressed[key] = true;
			const pressedKey = constant.keyMap.find(x => x.key === key);
			if (pressedKey == null)
				return;
			clientData.onKeyEvent({ ...pressedKey, state: true });
		});
		this.input.keyboard.on('keyup', (event) => {
			const key = event.key?.toLowerCase();
			if (clientData.onKeyEvent === null)
				return;
			if (clientData.keyPressed[key] === false)
				return;
			clientData.keyPressed[key] = false;
			const pressedKey = constant.keyMap.find(x => x.key === key);
			if (pressedKey == null)
				return;
			clientData.onKeyEvent({ ...pressedKey, state: false });
		});
	}
}
