import {Object3D, Camera} from 'three';
import {clothControllerFromObject} from './ClothControllerRegister';

export function clothSolverStepSimulation(clothObject: Object3D, camera: Camera) {
	const controller = clothControllerFromObject(clothObject);
	if (!controller) {
		console.log('no controller for', clothObject.uuid);
		return;
	}
	controller.update(camera);
}
