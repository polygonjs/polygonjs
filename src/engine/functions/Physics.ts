import {Object3D, Quaternion, Vector3} from 'three';
import {ShadersCollectionController} from '../nodes/js/code/utils/ShadersCollectionController';
import {getPhysicsWorldNodeFromWorldObject} from '../nodes/sop/PhysicsWorld';
import {BaseNodeType} from '../nodes/_Base';
import {
	ObjectNamedFunction0,
	ObjectNamedFunction1,
	ObjectNamedFunction2,
	ObjectNamedFunction3,
	ObjectNamedFunction4,
} from './_Base';
import {setWorldGravity, stepWorld} from '../../core/physics/PhysicsWorld';
import {
	RBDProperty,
	_getRBD,
	_physicsRBDAddForce,
	_physicsRBDAddForceAtPoint,
	_physicsRBDAddTorque,
	_physicsRBDApplyImpulse,
	_physicsRBDApplyImpulseAtPoint,
	_physicsRBDRemove,
	_physicsRBDResetAll,
	_physicsRBDApplyTorqueImpulse,
	_physicsRBDResetForces,
	_physicsRBDResetTorques,
	_setPhysicsRBDAngularVelocity,
	_setPhysicsRBDLinearVelocity,
	_setPhysicsRBDPosition,
	_setPhysicsRBDRotation,
} from '../../core/physics/PhysicsRBD';
import {
	RBDCapsuleProperty,
	_getPhysicsRBDCapsuleRadius,
	_setPhysicsRBDCapsuleProperty,
} from '../../core/physics/shapes/RBDCapsule';
import {
	_getPhysicsRBDConeHeight,
	_getPhysicsRBDConeRadius,
	_setPhysicsRBDConeProperty,
} from '../../core/physics/shapes/RBDCone';
import {
	RBDCuboidProperty,
	_getPhysicsRBDCuboidSizes,
	_setPhysicsRBDCuboidProperty,
} from '../../core/physics/shapes/RBDCuboid';
import {
	_getPhysicsRBDCylinderHeight,
	_getPhysicsRBDCylinderRadius,
	_setPhysicsRBDCylinderProperty,
} from '../../core/physics/shapes/RBDCylinder';
import {_getPhysicsRBDSphereRadius, _setPhysicsRBDSphereProperty} from '../../core/physics/shapes/RBDSphere';
import {getOrCreatePropertyRef} from '../../core/reactivity/RBDPropertyReactivity';
import {RBDCommonProperty} from '../../core/physics/shapes/_CommonHeightRadius';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {_matchArrayLength} from './_ArrayUtils';

//
//
// WORLD
//
//
export class physicsWorldReset extends ObjectNamedFunction0 {
	static override type() {
		return 'physicsWorldReset';
	}
	func(object3D: Object3D): void {
		const physicsWorldNode = getPhysicsWorldNodeFromWorldObject(object3D, this.scene);
		if (!physicsWorldNode) {
			// console.warn(`no ${SopType.PHYSICS_WORLD} node found`);
			return;
		}
		physicsWorldNode.setDirty();
	}
}

export class physicsWorldStepSimulation extends ObjectNamedFunction0 {
	constructor(node: BaseNodeType, shadersCollectionController?: ShadersCollectionController) {
		super(node, shadersCollectionController);
	}
	static override type() {
		return 'physicsWorldStepSimulation';
	}
	func(object3D: Object3D): void {
		stepWorld(object3D);
	}
}

export class setPhysicsWorldGravity extends ObjectNamedFunction2<[Vector3, number]> {
	static override type() {
		return 'setPhysicsWorldGravity';
	}
	func(object3D: Object3D, gravity: Vector3, lerp: number): void {
		setWorldGravity(object3D, gravity, lerp);
	}
}

//
//
// GET RBD SHAPE PROP
//
//

// capsule
export class getPhysicsRBDCapsuleRadius extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDCapsuleRadius';
	}
	func(object3D: Object3D): number {
		dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDCapsuleProperty.RADIUS).value);
		return _getPhysicsRBDCapsuleRadius(object3D)!;
	}
}
export class getPhysicsRBDCapsuleHeight extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDCapsuleHeight';
	}
	func(object3D: Object3D): number {
		dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDCapsuleProperty.HEIGHT).value);
		return _getPhysicsRBDCapsuleRadius(object3D)!;
	}
}
// cone
export class getPhysicsRBDConeHeight extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDConeHeight';
	}
	func(object3D: Object3D): number {
		dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDCommonProperty.HEIGHT).value);
		return _getPhysicsRBDConeHeight(object3D)!;
	}
}
export class getPhysicsRBDConeRadius extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDConeRadius';
	}
	func(object3D: Object3D): number {
		dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDCommonProperty.RADIUS).value);
		return _getPhysicsRBDConeRadius(object3D)!;
	}
}
// cuboid
export class getPhysicsRBDCuboidSizes extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'getPhysicsRBDCuboidSizes';
	}
	func(object3D: Object3D, target: Vector3): Vector3 {
		dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDCuboidProperty.SIZES).value);
		_getPhysicsRBDCuboidSizes(object3D, target);
		return target;
	}
}
// cylinder
export class getPhysicsRBDCylinderHeight extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDCylinderHeight';
	}
	func(object3D: Object3D): number {
		dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDCommonProperty.HEIGHT).value);
		return _getPhysicsRBDCylinderHeight(object3D)!;
	}
}
export class getPhysicsRBDCylinderRadius extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDCylinderRadius';
	}
	func(object3D: Object3D): number {
		dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDCommonProperty.RADIUS).value);
		return _getPhysicsRBDCylinderRadius(object3D)!;
	}
}
// sphere
export class getPhysicsRBDSphereRadius extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDSphereRadius';
	}
	func(object3D: Object3D): number {
		dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDCommonProperty.RADIUS).value);
		return _getPhysicsRBDSphereRadius(object3D)!;
	}
}
//
//
// SET RBD SHAPE PROP
//
//
export class setPhysicsRBDCapsuleProperty extends ObjectNamedFunction3<[number, number, boolean]> {
	static override type() {
		return 'setPhysicsRBDCapsuleProperty';
	}
	func(object3D: Object3D, scale: number, lerp: number, updateMatrix: boolean): void {
		_setPhysicsRBDCapsuleProperty(object3D, scale, lerp, updateMatrix);
	}
}
export class setPhysicsRBDConeProperty extends ObjectNamedFunction4<[number, number, number, boolean]> {
	static override type() {
		return 'setPhysicsRBDConeProperty';
	}
	func(object3D: Object3D, radius: number, height: number, lerp: number, updateMatrix: boolean): void {
		_setPhysicsRBDConeProperty(object3D, radius, height, lerp, updateMatrix);
	}
}
export class setPhysicsRBDCuboidProperty extends ObjectNamedFunction4<[Vector3, number, number, boolean]> {
	static override type() {
		return 'setPhysicsRBDCuboidProperty';
	}
	func(object3D: Object3D, sizes: Vector3, size: number, lerp: number, updateMatrix: boolean): void {
		_setPhysicsRBDCuboidProperty(object3D, sizes, size, lerp, updateMatrix);
	}
}
export class setPhysicsRBDCylinderProperty extends ObjectNamedFunction4<[number, number, number, boolean]> {
	static override type() {
		return 'setPhysicsRBDCylinderProperty';
	}
	func(object3D: Object3D, radius: number, height: number, lerp: number, updateMatrix: boolean): void {
		_setPhysicsRBDCylinderProperty(object3D, radius, height, lerp, updateMatrix);
	}
}
export class setPhysicsRBDSphereProperty extends ObjectNamedFunction3<[number, number, boolean]> {
	static override type() {
		return 'setPhysicsRBDSphereProperty';
	}
	func(object3D: Object3D, radius: number, lerp: number, updateMatrix: boolean): void {
		_setPhysicsRBDSphereProperty(object3D, radius, lerp, updateMatrix);
	}
}
//
//
// GET RBD PROP
//
//

// angular velocity
export class getPhysicsRBDAngularVelocity extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'getPhysicsRBDAngularVelocity';
	}
	func(object3D: Object3D, target: Vector3) {
		const body = _getRBD(object3D);
		if (body) {
			dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDProperty.ANGULAR_VELOCITY).value);
			const angvel = body.angvel();
			return target.set(angvel.x, angvel.y, angvel.z);
		} else {
			return target.set(0, 0, 0);
		}
	}
}
export class getChildrenPhysicsRBDPropertiesAngularVelocity extends ObjectNamedFunction1<[Array<Vector3>]> {
	static override type() {
		return 'getChildrenPhysicsRBDPropertiesAngularVelocity';
	}
	func(object3D: Object3D, values: Vector3[]): Vector3[] {
		dummyReadRefVal(this.timeController.timeUniform().value);
		_matchArrayLength(object3D.children, values, () => new Vector3());
		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const body = _getRBD(child);
			if (body) {
				const angvel = body.angvel();
				values[i].set(angvel.x, angvel.y, angvel.z);
			} else {
				values[i].set(0, 0, 0);
			}
			i++;
		}
		return values;
	}
}

// linear velocity

export class getPhysicsRBDLinearVelocity extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'getPhysicsRBDLinearVelocity';
	}
	func(object3D: Object3D, target: Vector3) {
		const body = _getRBD(object3D);
		if (body) {
			dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDProperty.LINEAR_VELOCITY).value);
			const linvel = body.linvel();
			return target.set(linvel.x, linvel.y, linvel.z);
		} else {
			return target.set(0, 0, 0);
		}
	}
}
export class getChildrenPhysicsRBDPropertiesLinearVelocity extends ObjectNamedFunction1<[Array<Vector3>]> {
	static override type() {
		return 'getChildrenPhysicsRBDPropertiesLinearVelocity';
	}
	func(object3D: Object3D, values: Vector3[]): Vector3[] {
		dummyReadRefVal(this.timeController.timeUniform().value);
		_matchArrayLength(object3D.children, values, () => new Vector3());
		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const body = _getRBD(child);
			if (body) {
				const linvel = body.linvel();
				values[i].set(linvel.x, linvel.y, linvel.z);
			} else {
				values[i].set(0, 0, 0);
			}
			i++;
		}
		return values;
	}
}
// angular damping

export class getPhysicsRBDAngularDamping extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDAngularDamping';
	}
	func(object3D: Object3D): number {
		const body = _getRBD(object3D);
		if (body) {
			dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDProperty.ANGULAR_DAMPING).value);
			return body.angularDamping();
		}
		return 0;
	}
}
export class getChildrenPhysicsRBDPropertiesAngularDamping extends ObjectNamedFunction1<[Array<number>]> {
	static override type() {
		return 'getChildrenPhysicsRBDPropertiesAngularDamping';
	}
	func(object3D: Object3D, values: number[]): number[] {
		_matchArrayLength(object3D.children, values, () => 0);
		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const body = _getRBD(child);
			values[i] = body ? body.angularDamping() : 0;
			i++;
		}
		return values;
	}
}
// linear damping
export class getPhysicsRBDLinearDamping extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDLinearDamping';
	}
	func(object3D: Object3D): number {
		const body = _getRBD(object3D);
		if (body) {
			dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDProperty.LINEAR_DAMPING).value);
			return body.linearDamping();
		}
		return 0;
	}
}
export class getChildrenPhysicsRBDPropertiesLinearDamping extends ObjectNamedFunction1<[Array<number>]> {
	static override type() {
		return 'getChildrenPhysicsRBDPropertiesLinearDamping';
	}
	func(object3D: Object3D, values: number[]): number[] {
		_matchArrayLength(object3D.children, values, () => 0);
		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const body = _getRBD(child);
			values[i] = body ? body.linearDamping() : 0;
			i++;
		}
		return values;
	}
}
// is sleeping
export class getPhysicsRBDIsSleeping extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDIsSleeping';
	}
	func(object3D: Object3D): boolean {
		const body = _getRBD(object3D);
		if (body) {
			dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDProperty.IS_SLEEPING).value);
			return body.isSleeping();
		}
		return false;
	}
}
export class getChildrenPhysicsRBDPropertiesIsSleeping extends ObjectNamedFunction1<[Array<boolean>]> {
	static override type() {
		return 'getChildrenPhysicsRBDPropertiesIsSleeping';
	}
	func(object3D: Object3D, values: boolean[]): boolean[] {
		_matchArrayLength(object3D.children, values, () => false);
		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const body = _getRBD(child);
			values[i] = body?.isSleeping() || false;
			i++;
		}
		return values;
	}
}
// is moving
export class getPhysicsRBDIsMoving extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDIsMoving';
	}
	func(object3D: Object3D): boolean {
		const body = _getRBD(object3D);
		if (body) {
			dummyReadRefVal(getOrCreatePropertyRef(this.timeController, object3D, RBDProperty.IS_MOVING).value);
			return body.isMoving();
		}
		return false;
	}
}
export class getChildrenPhysicsRBDPropertiesIsMoving extends ObjectNamedFunction1<[Array<boolean>]> {
	static override type() {
		return 'getChildrenPhysicsRBDPropertiesIsMoving';
	}
	func(object3D: Object3D, values: boolean[]): boolean[] {
		_matchArrayLength(object3D.children, values, () => false);
		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const body = _getRBD(child);
			values[i] = body?.isMoving() || false;
			i++;
		}
		return values;
	}
}

//
//
// SET RBD POS/ROT/VEL
//
//
export class setPhysicsRBDPosition extends ObjectNamedFunction2<[Vector3, number]> {
	static override type() {
		return 'setPhysicsRBDPosition';
	}
	func(object3D: Object3D, position: Vector3, lerp: number): void {
		_setPhysicsRBDPosition(object3D, position, lerp);
	}
}
export class setPhysicsRBDRotation extends ObjectNamedFunction2<[Quaternion, number]> {
	static override type() {
		return 'setPhysicsRBDRotation';
	}
	func(object3D: Object3D, quat: Quaternion, lerp: number): void {
		_setPhysicsRBDRotation(object3D, quat, lerp);
	}
}
export class setPhysicsRBDAngularVelocity extends ObjectNamedFunction2<[Vector3, number]> {
	static override type() {
		return 'setPhysicsRBDAngularVelocity';
	}
	func(object3D: Object3D, velocity: Vector3, lerp: number): void {
		_setPhysicsRBDAngularVelocity(object3D, velocity, lerp);
	}
}
export class setPhysicsRBDLinearVelocity extends ObjectNamedFunction2<[Vector3, number]> {
	static override type() {
		return 'setPhysicsRBDLinearVelocity';
	}
	func(object3D: Object3D, velocity: Vector3, lerp: number): void {
		_setPhysicsRBDLinearVelocity(object3D, velocity, lerp);
	}
}

//
//
// FORCES
//
//
export class physicsRBDAddForce extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'physicsRBDAddForce';
	}
	func(object3D: Object3D, force: Vector3): void {
		_physicsRBDAddForce(object3D, force);
	}
}

export class physicsRBDAddForceAtPoint extends ObjectNamedFunction2<[Vector3, Vector3]> {
	static override type() {
		return 'physicsRBDAddForceAtPoint';
	}
	func(object3D: Object3D, force: Vector3, point: Vector3): void {
		_physicsRBDAddForceAtPoint(object3D, force, point);
	}
}
export class physicsRBDAddTorque extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'physicsRBDAddTorque';
	}
	func(object3D: Object3D, force: Vector3): void {
		_physicsRBDAddTorque(object3D, force);
	}
}
export class physicsRBDApplyTorqueImpulse extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'physicsRBDApplyTorqueImpulse';
	}
	func(object3D: Object3D, impulse: Vector3): void {
		_physicsRBDApplyTorqueImpulse(object3D, impulse);
	}
}

export class physicsRBDApplyImpulse extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'physicsRBDApplyImpulse';
	}
	func(object3D: Object3D, impulse: Vector3): void {
		_physicsRBDApplyImpulse(object3D, impulse);
	}
}

export class physicsRBDApplyImpulseAtPoint extends ObjectNamedFunction2<[Vector3, Vector3]> {
	static override type() {
		return 'physicsRBDApplyImpulseAtPoint';
	}
	func(object3D: Object3D, impulse: Vector3, point: Vector3): void {
		_physicsRBDApplyImpulseAtPoint(object3D, impulse, point);
	}
}
export class physicsRBDRemove extends ObjectNamedFunction0 {
	static override type() {
		return 'physicsRBDRemove';
	}
	func(object3D: Object3D): void {
		_physicsRBDRemove(object3D);
	}
}
export class physicsRBDResetAll extends ObjectNamedFunction1<[boolean]> {
	static override type() {
		return 'physicsRBDResetAll';
	}
	func(object3D: Object3D, wakeup: boolean): void {
		_physicsRBDResetAll(object3D, wakeup);
	}
}
export class physicsRBDResetForces extends ObjectNamedFunction1<[boolean]> {
	static override type() {
		return 'physicsRBDResetForces';
	}
	func(object3D: Object3D, wakeup: boolean): void {
		_physicsRBDResetForces(object3D, wakeup);
	}
}
export class physicsRBDResetTorques extends ObjectNamedFunction1<[boolean]> {
	static override type() {
		return 'physicsRBDResetTorques';
	}
	func(object3D: Object3D, wakeup: boolean): void {
		_physicsRBDResetTorques(object3D, wakeup);
	}
}
