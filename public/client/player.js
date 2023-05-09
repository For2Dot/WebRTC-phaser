export default class Player {
	constructor() {
	}

	static prelodad(scene) {
		scene.load.atlas('female', '../assets/images/female.png', '../assets/images/female_atlas.json');
	}

	update() { }
}
