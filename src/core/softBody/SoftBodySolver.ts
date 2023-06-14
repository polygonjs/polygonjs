import {Object3D, Vector3} from 'three';
import {softBodyControllerFromObject, softBodyFromObject} from './SoftBodyControllerRegister';

export function softBodySolverStepSimulation(
	solverObject: Object3D,
	stepsCount: number
	// selectedVertexInfluence: number,
	// viscosity: number,
	// spring: number,
) {
	const controller = softBodyControllerFromObject(solverObject);
	if (!controller) {
		console.log('no controller for', solverObject.uuid);
		return;
	}
	controller.stepsCount = stepsCount;
	// controller.selectedVertexInfluence = selectedVertexInfluence;
	// controller.viscosity = viscosity;
	// controller.spring = spring;

	controller.step();
}

export function setSoftBodySolverGravity(solverObject: Object3D, gravity: Vector3, lerp: number) {
	const controller = softBodyControllerFromObject(solverObject);
	if (!controller) {
		console.log('no controller for', solverObject.uuid);
		return;
	}
	console.warn('setGravity not implemented');
}

export function setSoftBodySelectedVertexIndex(softBodyObject: Object3D, index: number) {
	const softBody = softBodyFromObject(softBodyObject);
	if (!softBody) {
		console.log('no softBody for', softBodyObject.uuid);
		return;
	}
	softBody.setSelectedVertexIndex(index);
}
export function setSoftBodySelectedVertexPosition(softBodyObject: Object3D, pos: Vector3, delta: number) {
	const softBody = softBodyFromObject(softBodyObject);
	if (!softBody) {
		console.log('no softBody for', softBodyObject.uuid);
		return;
	}
	softBody.setSelectedVertexPosition(pos, delta);
}
