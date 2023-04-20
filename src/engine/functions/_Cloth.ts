import {Object3D, Vector3} from 'three';
import {getClothControllerNodeFromWorldObject} from '../nodes/sop/ClothSolver';
import {ObjectNamedFunction0, ObjectNamedFunction1, ObjectNamedFunction4} from './_Base';
import {clothSolverStepSimulation as _clothSolverStepSimulation} from '../../core/cloth/ClothSolver';
import {_getPhysicsRBDSphereRadius, _setPhysicsRBDSphereProperty} from '../../core/physics/shapes/RBDSphere';
import {_matchArrayLength} from './_ArrayUtils';
import {clothControllerFromObject} from '../../core/cloth/ClothControllerRegister';

//
//
// WORLD
//
//
export class clothSolverReset extends ObjectNamedFunction0 {
	static override type() {
		return 'clothSolverReset';
	}
	func(object3D: Object3D): void {
		const clothSolverNode = getClothControllerNodeFromWorldObject(object3D, this.scene);
		if (!clothSolverNode) {
			// console.warn(`no ${SopType.PHYSICS_WORLD} node found`);
			return;
		}
		clothSolverNode.setDirty();
	}
}

export class clothSolverStepSimulation extends ObjectNamedFunction4<[number, number, number, number]> {
	static override type() {
		return 'clothSolverStepSimulation';
	}
	func(
		object3D: Object3D,
		stepsCount: number,
		selectedVertexInfluence: number,
		viscosity: number,
		spring: number
	): void {
		const delta = this.scene.timeController.delta();
		_clothSolverStepSimulation(object3D, delta, stepsCount, selectedVertexInfluence, viscosity, spring);
	}
}

export class clothSolverSetSelectedVertexIndex extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'clothSolverSetSelectedVertexIndex';
	}
	func(object3D: Object3D, index: number): void {
		const controller = clothControllerFromObject(object3D);
		if (controller) {
			controller.setSelectedVertexIndex(index);
		}
	}
}
export class clothSolverSetSelectedVertexPosition extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'clothSolverSetSelectedVertexPosition';
	}
	func(object3D: Object3D, position: Vector3): void {
		const controller = clothControllerFromObject(object3D);
		if (controller) {
			controller.setSelectedVertexPosition(position);
		}
	}
}
