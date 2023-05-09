import BootScene from "./BootScene.js";
import { clientData } from "./client.js";

const config = {
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundColor: "#333333",
	type: Phaser.AUTO,
	parent: 'simple-game',
	scene: [BootScene],
	scale: {
		zoom: 2,
	}
}
clientData.onStart = () => {
	console.log('Starting game');
	new Phaser.Game(config);
};
