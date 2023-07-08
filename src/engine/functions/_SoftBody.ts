import {Object3D, Vector3} from 'three';
import {getSoftBodyControllerNodeFromSolverObject} from '../nodes/sop/TetSoftBodySolver';
import {
	ObjectNamedFunction0,
	ObjectNamedFunction2,
	ObjectNamedFunction1,
	ObjectNamedFunction3,
	NamedFunction5,
	ObjectNamedFunction4,
} from './_Base';
import {
	softBodySolverStepSimulation as _softBodySolverStepSimulation,
	setSoftBodySolverGravity as _setSoftBodySolverGravity,
	softBodyConstraintCreate as _softBodyConstraintCreate,
	softBodyConstraintSetPosition as _softBodyConstraintSetPosition,
	softBodyConstraintDelete as _softBodyConstraintDelete,
} from '../../core/softBody/SoftBodySolver';
import {Ref} from '@vue/reactivity';

const _v3 = new Vector3();

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

export class softBodySolverStepSimulation extends ObjectNamedFunction4<[number, number, number, boolean]> {
	static override type() {
		return 'softBodySolverStepSimulation';
	}
	func(
		object3D: Object3D,
		stepsCount: number,
		edgeCompliance: number,
		volumeCompliance: number,
		preciseCollisions: boolean
	): void {
		_softBodySolverStepSimulation(object3D, stepsCount, edgeCompliance, volumeCompliance, preciseCollisions);
	}
}

export class computeVelocity extends NamedFunction5<[Vector3, Vector3, number, number, Vector3]> {
	static override type() {
		return 'computeVelocity';
	}
	func(velocity: Vector3, forces: Vector3, dt: number, drag: number, target: Vector3): Vector3 {
		_v3.copy(forces).multiplyScalar(dt);
		target.copy(velocity).multiplyScalar(drag).add(_v3);
		return target;
	}
}

export class softBodyConstraintCreate extends ObjectNamedFunction2<[number, Ref<number>]> {
	static override type() {
		return 'softBodyConstraintCreate';
	}
	func(object3D: Object3D, index: number, constraintIdRef: Ref<number>): void {
		const constraint = _softBodyConstraintCreate(object3D, index);
		if (constraint) {
			constraintIdRef.value = constraint.id;
		}
	}
}
export class softBodyConstraintSetPosition extends ObjectNamedFunction3<[number, Vector3, number]> {
	static override type() {
		return 'softBodyConstraintSetPosition';
	}
	func(object3D: Object3D, constraintId: number, position: Vector3, lerp: number): void {
		const delta = this.scene.timeController.delta();
		_softBodyConstraintSetPosition(object3D, constraintId, position, lerp, delta);
	}
}
export class softBodyConstraintDelete extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'softBodyConstraintDelete';
	}
	func(object3D: Object3D, constraintId: number): void {
		_softBodyConstraintDelete(object3D, constraintId);
	}
}
