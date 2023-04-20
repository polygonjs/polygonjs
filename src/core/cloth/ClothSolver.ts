import {Object3D} from 'three';
import {clothControllerFromObject} from './ClothControllerRegister';

export function clothSolverStepSimulation(
	clothObject: Object3D,
	delta: number,
	stepsCount: number,
	selectedVertexInfluence: number,
	viscosity: number,
	spring: number
) {
	const controller = clothControllerFromObject(clothObject);
	if (!controller) {
		console.log('no controller for', clothObject.uuid);
		return;
	}
	controller.stepsCount = stepsCount;
	controller.selectedVertexInfluence = selectedVertexInfluence;
	controller.viscosity = viscosity;
	controller.spring = spring;
	controller.update(delta);
}
