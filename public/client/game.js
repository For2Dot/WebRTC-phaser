import BootScene from "./BootScene.js";

const config = {
	width: 300,
	height: 300,
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
new Phaser.Game(config);