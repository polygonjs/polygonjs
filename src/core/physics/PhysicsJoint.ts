import {RigidBody, World} from '@dimforge/rapier3d';
import {Object3D, Vector3} from 'three';
import {PhysicsLib} from './CorePhysics';
import {CorePhysicsBaseAttribute} from './PhysicsAttribute';

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

export enum PhysicsJointAttribute {
	JOIN_TYPE = 'jointType',
	RBD_ID1 = 'rbdId1',
	RBD_ID2 = 'rbdId2',
	ANCHOR1 = 'anchor1',
	ANCHOR2 = 'anchor2',
}

const anchor1 = new Vector3();
const anchor2 = new Vector3();
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
	CorePhysicsJoinAttribute.getAnchor1(object, anchor1);
	CorePhysicsJoinAttribute.getAnchor2(object, anchor2);

	const params = PhysicsLib.JointData.spherical(anchor1, anchor2);
	const joint = world.createImpulseJoint(params, rbd1, rbd2, true);
	console.log('create joint', {joint, params, rbd1, rbd2});
	return joint;
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
}
