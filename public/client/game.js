import { constant } from "../constant.js";
import BootScene from "./BootScene.js";
import { clientData } from "./client.js";

const config = {
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundColor: "#333333",
	type: Phaser.AUTO,
	parent: 'simple-game',
	scene: [BootScene],
	pixelArt: true,
	fps: {
		target: 30,
		forceSetTimeOut: true,
	}
}
const game = new Phaser.Game(config);
const findScene = setInterval(() => {
	clientData.scene = game.scene.getScenes()[0];
	if (clientData.scene != null)
		clearInterval(findScene);
}, 1);
clientData.scene = game.scene.getScenes()[0];
