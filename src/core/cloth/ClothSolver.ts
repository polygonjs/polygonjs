import {Object3D} from 'three';
import {clothControllerFromObject} from './ClothControllerRegister';

export function clothSolverStepSimulation(clothObject: Object3D) {
	const controller = clothControllerFromObject(clothObject);
	if (!controller) {
		console.log('no controller for', clothObject.uuid);
		return;
	}
	controller.update();
}
