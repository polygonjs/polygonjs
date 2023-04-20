import {Object3D, Vector3} from 'three';
import {getClothControllerNodeFromWorldObject} from '../nodes/sop/ClothSolver';
import {ObjectNamedFunction0, ObjectNamedFunction1} from './_Base';
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

export class clothSolverStepSimulation extends ObjectNamedFunction0 {
	static override type() {
		return 'clothSolverStepSimulation';
	}
	func(object3D: Object3D): void {
		_clothSolverStepSimulation(object3D);
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
