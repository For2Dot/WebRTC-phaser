import Player from "./entity/player.js";
import { clientData } from "./client.js";
import { constant, entityType } from "../constant.js";
import TestBall from "./entity/testBall.js";

export default class BootScene extends Phaser.Scene {
	constructor() {
		super("BootScene");
		this.keyState = {};
		this.images = {};
	}

	preload() {
		Player.prelodad(this);
		TestBall.prelodad(this);
	}

	create() {
		const cameraFollowPlayer = () => {
			const playerEntity = Object.values(clientData.entities).find(x => x.meta.connId == clientData.connId);
			const mine = playerEntity;
			if (mine != null) {
				const { width, height } = this.game.canvas;
				this.mine = mine;
				this.cameras.main.setBounds(0, 0, width * 2, height * 2);
				this.cameras.main.startFollow(this.mine.getMainImage());
			} else {
				setTimeout(cameraFollowPlayer, 1000);
			}
		}
		cameraFollowPlayer();
	}

	update() {
		for (const id in clientData.entities) {
			clientData.entities[id].update();
		}
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
