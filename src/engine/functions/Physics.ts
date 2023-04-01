import {Object3D, Quaternion, Vector3} from 'three';
import {ShadersCollectionController} from '../nodes/js/code/utils/ShadersCollectionController';
import {getPhysicsWorldNodeFromWorldObject} from '../nodes/sop/PhysicsWorld';
import {BaseNodeType} from '../nodes/_Base';
import {TimeController} from '../scene/utils/TimeController';
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
import {_dummyReadPropertyRefVal} from '../../core/reactivity/ObjectPropertyReactivity';
import {getOrCreatePropertyRef} from '../../core/reactivity/RBDPropertyReactivity';
import {RBDCommonProperty} from '../../core/physics/shapes/_CommonHeightRadius';

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
	protected timeController: TimeController;
	constructor(node: BaseNodeType, shadersCollectionController?: ShadersCollectionController) {
		super(node, shadersCollectionController);
		this.timeController = node.scene().timeController;
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
		const _ref = getOrCreatePropertyRef(object3D, RBDCapsuleProperty.RADIUS);
		_dummyReadPropertyRefVal(_ref.value);
		return _getPhysicsRBDCapsuleRadius(object3D)!;
	}
}
export class getPhysicsRBDCapsuleHeight extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDCapsuleHeight';
	}
	func(object3D: Object3D): number {
		const _ref = getOrCreatePropertyRef(object3D, RBDCapsuleProperty.HEIGHT);
		_dummyReadPropertyRefVal(_ref.value);
		return _getPhysicsRBDCapsuleRadius(object3D)!;
	}
}
// cone
export class getPhysicsRBDConeHeight extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDConeHeight';
	}
	func(object3D: Object3D): number {
		const _ref = getOrCreatePropertyRef(object3D, RBDCommonProperty.HEIGHT);
		_dummyReadPropertyRefVal(_ref.value);
		return _getPhysicsRBDConeHeight(object3D)!;
	}
}
export class getPhysicsRBDConeRadius extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDConeRadius';
	}
	func(object3D: Object3D): number {
		const _ref = getOrCreatePropertyRef(object3D, RBDCommonProperty.RADIUS);
		_dummyReadPropertyRefVal(_ref.value);
		return _getPhysicsRBDConeRadius(object3D)!;
	}
}
// cuboid
export class getPhysicsRBDCuboidSizes extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'getPhysicsRBDCuboidSizes';
	}
	func(object3D: Object3D, target: Vector3): Vector3 {
		const _ref = getOrCreatePropertyRef(object3D, RBDCuboidProperty.SIZES);
		_dummyReadPropertyRefVal(_ref.value);
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
		const _ref = getOrCreatePropertyRef(object3D, RBDCommonProperty.HEIGHT);
		_dummyReadPropertyRefVal(_ref.value);
		return _getPhysicsRBDCylinderHeight(object3D)!;
	}
}
export class getPhysicsRBDCylinderRadius extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDCylinderRadius';
	}
	func(object3D: Object3D): number {
		const _ref = getOrCreatePropertyRef(object3D, RBDCommonProperty.RADIUS);
		_dummyReadPropertyRefVal(_ref.value);
		return _getPhysicsRBDCylinderRadius(object3D)!;
	}
}
// sphere
export class getPhysicsRBDSphereRadius extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDSphereRadius';
	}
	func(object3D: Object3D): number {
		const _ref = getOrCreatePropertyRef(object3D, RBDCommonProperty.RADIUS);
		_dummyReadPropertyRefVal(_ref.value);
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
// GET RBD POS/ROT/VEL
//
//
export class getPhysicsRBDAngularVelocity extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'getPhysicsRBDAngularVelocity';
	}
	func(object3D: Object3D, target: Vector3): Vector3 {
		const body = _getRBD(object3D);
		if (body) {
			const _ref = getOrCreatePropertyRef(object3D, RBDProperty.ANGULAR_VELOCITY);
			_dummyReadPropertyRefVal(_ref.value);
			const linVel = body.linvel();
			return target.set(linVel.x, linVel.y, linVel.z);
		} else {
			return target.set(0, 0, 0);
		}
	}
}
export class getPhysicsRBDLinearVelocity extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'getPhysicsRBDLinearVelocity';
	}
	func(object3D: Object3D, target: Vector3): Vector3 {
		const body = _getRBD(object3D);
		if (body) {
			const _ref = getOrCreatePropertyRef(object3D, RBDProperty.LINEAR_VELOCITY);
			_dummyReadPropertyRefVal(_ref.value);
			const angVel = body.angvel();
			return target.set(angVel.x, angVel.y, angVel.z);
		} else {
			return target.set(0, 0, 0);
		}
	}
}
export class getPhysicsRBDAngularDamping extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDAngularDamping';
	}
	func(object3D: Object3D): number {
		const body = _getRBD(object3D);
		if (body) {
			const _ref = getOrCreatePropertyRef(object3D, RBDProperty.ANGULAR_DAMPING);
			_dummyReadPropertyRefVal(_ref.value);
			return body.angularDamping();
		}
		return 0;
	}
}
export class getPhysicsRBDLinearDamping extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDLinearDamping';
	}
	func(object3D: Object3D): number {
		const body = _getRBD(object3D);
		if (body) {
			const _ref = getOrCreatePropertyRef(object3D, RBDProperty.LINEAR_DAMPING);
			_dummyReadPropertyRefVal(_ref.value);
			return body.linearDamping();
		}
		return 0;
	}
}
export class getPhysicsRBDIsSleeping extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDIsSleeping';
	}
	func(object3D: Object3D): boolean {
		const body = _getRBD(object3D);
		if (body) {
			const _ref = getOrCreatePropertyRef(object3D, RBDProperty.IS_SLEEPING);
			_dummyReadPropertyRefVal(_ref.value);
			return body.isSleeping();
		}
		return false;
	}
}
export class getPhysicsRBDIsMoving extends ObjectNamedFunction0 {
	static override type() {
		return 'getPhysicsRBDIsMoving';
	}
	func(object3D: Object3D): boolean {
		const body = _getRBD(object3D);
		if (body) {
			const _ref = getOrCreatePropertyRef(object3D, RBDProperty.IS_MOVING);
			_dummyReadPropertyRefVal(_ref.value);
			return body.isMoving();
		}
		return false;
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
