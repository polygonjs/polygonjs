import {Object3D} from 'three';
import {getClothControllerNodeFromWorldObject} from '../nodes/sop/ClothSolver';
import {ObjectNamedFunction0} from './_Base';
import {clothSolverStepSimulation as _clothSolverStepSimulation} from '../../core/cloth/ClothSolver';
import {_getPhysicsRBDSphereRadius, _setPhysicsRBDSphereProperty} from '../../core/physics/shapes/RBDSphere';
import {_matchArrayLength} from './_ArrayUtils';

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
		const camera = this.scene.camerasController.cameraObjects()[0];
		if (!camera) {
			console.log('no camera');
			return;
		}
		_clothSolverStepSimulation(object3D, camera);
	}
}
