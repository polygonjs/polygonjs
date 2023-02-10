import type {
	RigidBody,
	World,
	ImpulseJoint,
	FixedImpulseJoint,
	PrismaticImpulseJoint,
	SphericalImpulseJoint,
	RevoluteImpulseJoint,
} from '@dimforge/rapier3d';
import {Object3D, Vector4, Vector3, Vector2} from 'three';
import {PhysicsLib} from './CorePhysics';
import {CorePhysicsBaseAttribute} from './PhysicsAttribute';
import {TypeAssert} from './../../engine/poly/Assert';
export enum PhysicsJointType {
	FIXED = 'fixed',
	SPHERICAL = 'spherical',
	REVOLUT = 'revolute',
	PRISMATIC = 'prismatic',
}
export const PHYSICS_JOINT_TYPES: PhysicsJointType[] = [
	PhysicsJointType.FIXED,
	PhysicsJointType.SPHERICAL,
	PhysicsJointType.REVOLUT,
	PhysicsJointType.PRISMATIC,
];
const ALLOWED_JOIN_TYPES = [PhysicsJointType.FIXED, PhysicsJointType.SPHERICAL];
export const PHYSICS_JOINT_TYPE_MENU_ENTRIES = ALLOWED_JOIN_TYPES.map((name, value) => ({name, value}));

export enum PhysicsJointAttribute {
	JOIN_TYPE = 'jointType',
	RBD_ID1 = 'rbdId1',
	RBD_ID2 = 'rbdId2',
	ANCHOR1 = 'anchor1',
	ANCHOR2 = 'anchor2',
	LIMIT = 'limit',
	AXIS = 'axis',
	FRAME1 = 'frame1',
	FRAME2 = 'frame2',
}
const wakeUp = true;
const _limit = new Vector2();
const _anchor1 = new Vector3();
const _anchor2 = new Vector3();
const _axis = new Vector3();
const _frame1 = new Vector4();
const _frame2 = new Vector4();
export function physicsCreateJoint(
	PhysicsLib: PhysicsLib,
	world: World,
	worldObject: Object3D,
	object: Object3D,
	rigidBodyById: Map<string, RigidBody>
) {
	const jointType = CorePhysicsJoinAttribute.getJoinType(object);
	if (!jointType) {
		return;
	}

	const rbdId1 = CorePhysicsJoinAttribute.getRBDId1(object);
	const rbdId2 = CorePhysicsJoinAttribute.getRBDId2(object);
	const rbd1 = rigidBodyById.get(rbdId1);
	const rbd2 = rigidBodyById.get(rbdId2);
	if (!(rbd1 && rbd2)) {
		return;
	}
	CorePhysicsJoinAttribute.getAnchor1(object, _anchor1);
	CorePhysicsJoinAttribute.getAnchor2(object, _anchor2);

	const joint = _createJoint(world, PhysicsLib, object, jointType, rbd1, rbd2, _anchor1, _anchor2);

	// configureMotorPosition(targetPos, stiffness, damping)
	// configureMotorVelocity(targetVel, damping)
	// configureMotor(targetPos, targetVel, stiffness, damping)
	// configureMotorModel(model)
	// console.log(joint);
	// if ((joint as PrismaticImpulseJoint).configureMotorPosition) {
	// 	(joint as PrismaticImpulseJoint).configureMotorPosition(0, 1, 1);
	// } else {
	// 	console.warn('configureMotorPosition not available');
	// }
	// if ((joint as PrismaticImpulseJoint).configureMotorVelocity) {
	// 	(joint as PrismaticImpulseJoint).configureMotorVelocity(-10, 0.5);
	// } else {
	// 	console.warn('configureMotorVelocity not available');
	// }
	// if ((joint as PrismaticImpulseJoint).configureMotor) {
	// 	(joint as PrismaticImpulseJoint).configureMotor(0, 0.1, 1, 1);
	// } else {
	// 	console.warn('configureMotor not available');
	// }
	// console.log('create joint', jointType, joint);

	// remove object from hierarchy after joint creation,
	// so that it doesn't need to be parsed when traversing the scene
	object.parent?.remove(object);

	return joint;
}

function _createJoint(
	world: World,
	PhysicsLib: PhysicsLib,
	object: Object3D,
	jointType: PhysicsJointType,
	rbd1: RigidBody,
	rbd2: RigidBody,
	anchor1: Vector3,
	anchor2: Vector3
): ImpulseJoint {
	switch (jointType) {
		case PhysicsJointType.FIXED: {
			CorePhysicsJoinAttribute.getFrame1(object, _frame1);
			CorePhysicsJoinAttribute.getFrame2(object, _frame2);
			// const rot1 = {w: 1.0, x: 0.0, y: 0.0, z: 0.0};
			// const rot2 = {w: 1.0, x: 0.0, y: 0.0, z: 0.0};
			// console.log(_frame1.toArray());
			// console.log(_frame2.toArray());
			const params = PhysicsLib.JointData.fixed(anchor1, _frame1, anchor2, _frame2);
			const joint = world.createImpulseJoint(params, rbd1, rbd2, wakeUp) as FixedImpulseJoint;
			return joint;
		}
		case PhysicsJointType.PRISMATIC: {
			CorePhysicsJoinAttribute.getAxis(object, _axis);
			// const axis = {x: 1.0, y: 0.0, z: 0.0};
			const params = PhysicsLib.JointData.prismatic(anchor1, anchor2, _axis);
			params.limitsEnabled = true;
			CorePhysicsJoinAttribute.getLimit(object, _limit);
			params.limits = [_limit.x, _limit.y];
			const joint = world.createImpulseJoint(params, rbd1, rbd2, wakeUp) as PrismaticImpulseJoint;
			joint.setLimits(_limit.x, _limit.y);
			return joint;
		}
		case PhysicsJointType.REVOLUT: {
			CorePhysicsJoinAttribute.getAxis(object, _axis);
			console.log(_axis.toArray());
			// const axis = {x: 0.0, y: 0.0, z: 1.0};
			const params = PhysicsLib.JointData.revolute(anchor1, anchor2, _axis);
			params.limitsEnabled = true;
			params.limits = [_limit.x, _limit.y];
			const joint = world.createImpulseJoint(params, rbd1, rbd2, wakeUp) as RevoluteImpulseJoint;
			CorePhysicsJoinAttribute.getLimit(object, _limit);
			joint.setLimits(_limit.x, _limit.y);
			return joint;
		}
		case PhysicsJointType.SPHERICAL: {
			const params = PhysicsLib.JointData.spherical(anchor1, anchor2);
			const joint = world.createImpulseJoint(params, rbd1, rbd2, wakeUp) as SphericalImpulseJoint;
			return joint;
		}
	}
	TypeAssert.unreachable(jointType);
}

export class CorePhysicsJoinAttribute extends CorePhysicsBaseAttribute {
	// common
	static setJoinType(object: Object3D, value: PhysicsJointType) {
		this._setString(object, PhysicsJointAttribute.JOIN_TYPE, value);
	}
	static getJoinType(object: Object3D): PhysicsJointType {
		return this._getString(object, PhysicsJointAttribute.JOIN_TYPE) as PhysicsJointType;
	}
	static setRBDId1(object: Object3D, value: string) {
		this._setString(object, PhysicsJointAttribute.RBD_ID1, value);
	}
	static getRBDId1(object: Object3D): string {
		return this._getString(object, PhysicsJointAttribute.RBD_ID1) as string;
	}
	static setRBDId2(object: Object3D, value: string) {
		this._setString(object, PhysicsJointAttribute.RBD_ID2, value);
	}
	static getRBDId2(object: Object3D): string {
		return this._getString(object, PhysicsJointAttribute.RBD_ID2) as string;
	}
	static setAnchor1(object: Object3D, value: Vector3) {
		this._setVector3(object, PhysicsJointAttribute.ANCHOR1, value);
	}
	static getAnchor1(object: Object3D, value: Vector3): void {
		return this._getVector3(object, PhysicsJointAttribute.ANCHOR1, value);
	}
	static setAnchor2(object: Object3D, value: Vector3) {
		this._setVector3(object, PhysicsJointAttribute.ANCHOR2, value);
	}
	static getAnchor2(object: Object3D, value: Vector3): void {
		return this._getVector3(object, PhysicsJointAttribute.ANCHOR2, value);
	}
	static setLimit(object: Object3D, value: Vector2) {
		this._setVector2(object, PhysicsJointAttribute.LIMIT, value);
	}
	static getLimit(object: Object3D, value: Vector2): void {
		return this._getVector2(object, PhysicsJointAttribute.LIMIT, value);
	}
	static setAxis(object: Object3D, value: Vector3) {
		this._setVector3(object, PhysicsJointAttribute.AXIS, value);
	}
	static getAxis(object: Object3D, value: Vector3): void {
		return this._getVector3(object, PhysicsJointAttribute.AXIS, value);
	}
	static setFrame1(object: Object3D, value: Vector4) {
		this._setVector4(object, PhysicsJointAttribute.FRAME1, value);
	}
	static getFrame1(object: Object3D, value: Vector4): void {
		return this._getVector4(object, PhysicsJointAttribute.FRAME1, value);
	}
	static setFrame2(object: Object3D, value: Vector4) {
		this._setVector4(object, PhysicsJointAttribute.FRAME2, value);
	}
	static getFrame2(object: Object3D, value: Vector4): void {
		return this._getVector4(object, PhysicsJointAttribute.FRAME2, value);
	}
}
