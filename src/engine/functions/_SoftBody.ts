import {Object3D, Vector3} from 'three';
import {getSoftBodyControllerNodeFromSolverObject} from '../nodes/sop/TetSoftBodySolver';
import {ObjectNamedFunction0, ObjectNamedFunction1, ObjectNamedFunction2} from './_Base';
import {
	softBodySolverStepSimulation as _softBodySolverStepSimulation,
	setSoftBodySolverGravity as _setSoftBodySolverGravity,
	setSoftBodySelectedVertexIndex as _setSoftBodySelectedVertexIndex,
	setSoftBodySelectedVertexPosition as _setSoftBodySelectedVertexPosition,
} from '../../core/softBody/SoftBodySolver';

//
//
// WORLD
//
//
export class softBodySolverReset extends ObjectNamedFunction0 {
	static override type() {
		return 'softBodySolverReset';
	}
	func(object3D: Object3D): void {
		const softBodySolverNode = getSoftBodyControllerNodeFromSolverObject(object3D, this.scene);
		if (!softBodySolverNode) {
			// console.warn(`no ${SopType.PHYSICS_WORLD} node found`);
			return;
		}
		softBodySolverNode.setDirty();
	}
}

export class softBodySolverStepSimulation extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'softBodySolverStepSimulation';
	}
	func(object3D: Object3D, stepsCount: number): void {
		_softBodySolverStepSimulation(object3D, stepsCount);
	}
}

export class setSoftBodySolverGravity extends ObjectNamedFunction2<[Vector3, number]> {
	static override type() {
		return 'setSoftBodySolverGravity';
	}
	func(object3D: Object3D, gravity: Vector3, lerp: number): void {
		_setSoftBodySolverGravity(object3D, gravity, lerp);
	}
}
export class setSoftBodySelectedVertexIndex extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'setSoftBodySelectedVertexIndex';
	}
	func(object3D: Object3D, index: number): void {
		_setSoftBodySelectedVertexIndex(object3D, index);
	}
}
export class setSoftBodySelectedVertexPosition extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'setSoftBodySelectedVertexPosition';
	}
	func(object3D: Object3D, position: Vector3): void {
		const delta = this.scene.timeController.delta();
		_setSoftBodySelectedVertexPosition(object3D, position, delta);
	}
}
