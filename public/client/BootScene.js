import Player from "./player.js";
import { clientData } from "./client.js";
import { constant, entityType } from "../constant.js";

export default class BootScene extends Phaser.Scene {
	constructor() {
		super("BootScene");
		this.keyState = {};
		this.images = {};
	}

	preload() {
		Player.prelodad(this);
		this.load.image("ship", "../assets/images/ship.png")
	}

	create() {
		const cameraFollowPlayer = () => {
			const playerEntity = clientData.entities.find(x => x.connId == clientData.connId);
			const mine = this.images[playerEntity?.id];
			if (mine != null) {
				const { width, height } = this.game.canvas;
				this.mine = mine;
				this.cameras.main.setBounds(0, 0, width * 2, height * 2);
				this.cameras.main.startFollow(this.mine);
			} else {
				setTimeout(cameraFollowPlayer, 1000);
			}
		}
		cameraFollowPlayer();
	}

	update() {
		for (const id in this.images) {
			if (clientData.entities.find(x => x.id == id) == null) {
				this.images[id].destroy();
				delete this.images[id];
			}
		}
		clientData.entities.map(entity => {
			let image = this.images[entity.id];
			if (image == null) {
				if (entity.type == entityType.PLAYER)
					image = new Phaser.GameObjects.Image(this, entity.x, entity.y, "female", "townsfolk_f_idle_1");
				if (entity.type == entityType.ENTITY)
					image = new Phaser.GameObjects.Image(this, entity.x, entity.y, "ship");
				this.images[entity.id] = image;
				this.add.existing(image);
			}
			image.setPosition(entity.x, entity.y);
		});
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
