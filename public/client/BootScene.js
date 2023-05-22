import Player from "./entity/player.js";
import { clientData } from "./client.js";
import { constant, entityType } from "../constant.js";
import Entity from "./entity/entity.js";
import Wall from "./entity/wall.js";
import Door from "./entity/door.js";
import Generator from "./entity/generator.js";

export default class BootScene extends Phaser.Scene {
	constructor() {
		super("BootScene");
		this.keyState = {};
		this.images = {};
	}

	preload() {
		Player.prelodad(this);
		Wall.prelodad(this);
		Door.prelodad(this);
		Generator.prelodad(this);
		this.load.image('background', '../assets/images/testmap.png');
	}

	create() {
		this.add.image(438, 360, 'background');
		const graphics = this.add.graphics();
		graphics.fillStyle(0xffffff, 0.1);
		clientData.visionMask = new Phaser.Display.Masks.GeometryMask(this, graphics);
		const cameraFollowPlayer = () => {
			const playerEntity = Object.values(clientData.players).find(x => x.meta.connId == clientData.connId);
			const mine = playerEntity;
			if (mine != null) {
				const { width, height } = this.game.canvas;
				this.mine = mine;
				this.cameras.main.setBounds(0, 0, width * 2, height * 2);
				if (this.mine.getMainImage == null) {
					console.log(this.mine);
					throw new Error("what?");
				}
				this.cameras.main.startFollow(this.mine.getMainImage());
			} else {
				setTimeout(cameraFollowPlayer, 1000);
			}
		}
		cameraFollowPlayer();
		this.cameras.main.setZoom(constant.clientZoom, constant.clientZoom);
	}

	updateVisionMask(x, y) {
		const polygons = [];
		polygons.push([[-1000, -1000], [1000, -1000], [1000, 1000], [-1000, 1000]]);
		for (const entityId in clientData.entities) {
			if (clientData.entities[entityId].meta.type == entityType.WALL || 
				(clientData.entities[entityId].meta.type == entityType.DOOR && clientData.entities[entityId].isOpened == false) ) {
				const { x, y, width, height } = clientData.entities[entityId].meta;
				polygons.push([
					[x - width * 0.5, y - height * 0.5],
					[x - width * 0.5, y + height * 0.5],
					[x + width * 0.5, y + height * 0.5],
					[x + width * 0.5, y - height * 0.5],
				]);
			}
		}
		let segments = VisibilityPolygon.convertToSegments(polygons);
		segments = VisibilityPolygon.breakIntersections(segments);
		const position = [x, y];
		if (VisibilityPolygon.inPolygon(position, polygons[0])) {
			const visibility = VisibilityPolygon.compute(position, segments);
			const graphics = clientData.visionMask.geometryMask;
			graphics.clear();
			graphics.beginPath();
			graphics.moveTo(visibility[0][0], visibility[0][1]);
			for (const idx in visibility) {
				const [x1, y1] = visibility[+idx];
				graphics.lineTo(x1, y1);
			}
			graphics.fillPath();
			clientData.visionMask.setShape(graphics);
		}
	}

	update() {
		if (this.mine != null) {
			this.updateVisionMask(+this.mine.x, +this.mine.y);
		}
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
