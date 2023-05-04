import BootScene from "./BootScene.js";
import clientData from "./data.js";

const config = {
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundColor: "#333333",
	type: Phaser.AUTO,
	parent: 'simple-game',
	scene: [BootScene],
	scale: {
		zoom: 2,
	},
	physics: {
		default: 'matter',
		matter: {
			debug: true,
			gravity: {y: 0},
		}
	},
	plugins: {
		scene: [
			{
				plugin: PhaserMatterCollisionPlugin,
				key: 'matterCollision',
				mapping: 'matterCollision'
			}
		]
	}
}
clientData.onStart = () => {
	console.log('Starting game');
	new Phaser.Game(config);
};