import {CoreObject} from '../geometry/Object';
import {Vector3, Object3D} from 'three';
import {PhysicsJointAttribute} from './PhysicsJoint';
export enum PhysicsRBDType {
	FIXED = 'fixed',
	DYNAMIC = 'dynamic',
	// KINEMATIC_VEL = 'kinematicVelocityBased',
	KINEMATIC_POS = 'kinematicPositionBased',
}
export const PHYSICS_RBD_TYPES: PhysicsRBDType[] = [
	PhysicsRBDType.FIXED,
	PhysicsRBDType.DYNAMIC,
	PhysicsRBDType.KINEMATIC_POS,
];
export const PHYSICS_RBD_TYPE_MENU_ENTRIES = PHYSICS_RBD_TYPES.map((name, value) => ({name, value}));

export enum PhysicsRBDColliderType {
	CAPSULE = 'capsule',
	CONE = 'cone',
	CONVEX_HULL = 'convex hull',
	// CONVEX_MESH = 'convex mesh',
	CUBOID = 'cuboid',
	CYLINDER = 'cylinder',
	SPHERE = 'sphere',
	TRIMESH = 'trimesh',
	// heightfield
}
export const PHYSICS_RBD_COLLIDER_TYPES: PhysicsRBDColliderType[] = [
	PhysicsRBDColliderType.CUBOID,
	PhysicsRBDColliderType.SPHERE,
	PhysicsRBDColliderType.CAPSULE,
	PhysicsRBDColliderType.CYLINDER,
	PhysicsRBDColliderType.CONE,
	PhysicsRBDColliderType.CONVEX_HULL,
	// PhysicsRBDColliderType.CONVEX_MESH,
	PhysicsRBDColliderType.TRIMESH,
];
const SORTED_ENTRIES: PhysicsRBDColliderType[] = [
	PhysicsRBDColliderType.CAPSULE,
	PhysicsRBDColliderType.CONE,
	PhysicsRBDColliderType.CONVEX_HULL,
	// PhysicsRBDColliderType.CONVEX_MESH,
	PhysicsRBDColliderType.CUBOID,
	PhysicsRBDColliderType.CYLINDER,
	PhysicsRBDColliderType.SPHERE,
	PhysicsRBDColliderType.TRIMESH,
];
export const PHYSICS_RBD_COLLIDER_TYPE_MENU_ENTRIES = SORTED_ENTRIES.map((entry) => {
	return {name: entry, value: PHYSICS_RBD_COLLIDER_TYPES.indexOf(entry)};
});

export enum PhysicsRBDCuboidAttribute {
	SIZES = 'sizes',
	SIZE = 'size',
}
export enum PhysicsRBDSphereAttribute {
	RADIUS = 'radius',
}
export enum PhysicsRBDCapsuleAttribute {
	HEIGHT = 'height',
	RADIUS = 'radius',
}
export enum PhysicsRBDCylinderAttribute {
	HEIGHT = 'height',
	RADIUS = 'radius',
}

export enum PhysicsCommonAttribute {
	RBD_ID = 'RBDId',
	RBD_TYPE = 'RBDType',
	COLLIDER_TYPE = 'RBDColliderType',
	DENSITY = 'density',
	RESTITUTION = 'restitution',
	FRICTION = 'friction',
	LINEAR_DAMPING = 'linearDamping',
	ANGULAR_DAMPING = 'angularDamping',
}
type PhysicsAttribute =
	| PhysicsCommonAttribute
	| PhysicsRBDCuboidAttribute
	| PhysicsRBDSphereAttribute
	| PhysicsRBDCapsuleAttribute
	| PhysicsJointAttribute;

export class CorePhysicsBaseAttribute {
	protected static _setVector3(object: Object3D, attribName: PhysicsAttribute, value: Vector3) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getVector3(object: Object3D, attribName: PhysicsAttribute, target: Vector3) {
		CoreObject.attribValue(object, attribName, 0, target);
	}
	protected static _setNumber(object: Object3D, attribName: PhysicsAttribute, value: number) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getNumber(object: Object3D, attribName: PhysicsAttribute): number {
		return CoreObject.attribValue(object, attribName, 0) as number;
	}
	protected static _setString(object: Object3D, attribName: PhysicsAttribute, value: string) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getString(object: Object3D, attribName: PhysicsAttribute): string {
		return CoreObject.attribValue(object, attribName, 0) as string;
	}
}

export class CorePhysicsAttribute extends CorePhysicsBaseAttribute {
	// common
	static setRBDId(object: Object3D, value: string) {
		this._setString(object, PhysicsCommonAttribute.RBD_ID, value);
	}
	static getRBDId(object: Object3D): string {
		return this._getString(object, PhysicsCommonAttribute.RBD_ID) as string;
	}
	static setRBDType(object: Object3D, value: PhysicsRBDType) {
		this._setString(object, PhysicsCommonAttribute.RBD_TYPE, value);
	}
	static getRBDType(object: Object3D): PhysicsRBDType | undefined {
		return this._getString(object, PhysicsCommonAttribute.RBD_TYPE) as PhysicsRBDType | undefined;
	}
	static setColliderType(object: Object3D, value: PhysicsRBDColliderType) {
		this._setString(object, PhysicsCommonAttribute.COLLIDER_TYPE, value);
	}
	static getColliderType(object: Object3D): PhysicsRBDColliderType | undefined {
		return this._getString(object, PhysicsCommonAttribute.COLLIDER_TYPE) as PhysicsRBDColliderType | undefined;
	}
	static setDensity(object: Object3D, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.DENSITY, value);
	}
	static getDensity(object: Object3D) {
		return this._getNumber(object, PhysicsCommonAttribute.DENSITY);
	}
	static setRestitution(object: Object3D, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.RESTITUTION, value);
	}
	static getRestitution(object: Object3D) {
		return this._getNumber(object, PhysicsCommonAttribute.RESTITUTION);
	}
	static setFriction(object: Object3D, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.FRICTION, value);
	}
	static getFriction(object: Object3D) {
		return this._getNumber(object, PhysicsCommonAttribute.FRICTION);
	}
	static setLinearDamping(object: Object3D, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.LINEAR_DAMPING, value);
	}
	static getLinearDamping(object: Object3D) {
		return this._getNumber(object, PhysicsCommonAttribute.LINEAR_DAMPING);
	}
	static setAngularDamping(object: Object3D, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.ANGULAR_DAMPING, value);
	}
	static getAngularDamping(object: Object3D) {
		return this._getNumber(object, PhysicsCommonAttribute.ANGULAR_DAMPING);
	}

	// cuboid
	static setCuboidSizes(object: Object3D, value: Vector3) {
		this._setVector3(object, PhysicsRBDCuboidAttribute.SIZES, value);
	}
	static getCuboidSizes(object: Object3D, value: Vector3) {
		this._getVector3(object, PhysicsRBDCuboidAttribute.SIZES, value);
	}
	static setCuboidSize(object: Object3D, value: number) {
		this._setNumber(object, PhysicsRBDCuboidAttribute.SIZE, value);
	}
	static getCuboidSize(object: Object3D) {
		return this._getNumber(object, PhysicsRBDCuboidAttribute.SIZE);
	}
	// sphere + capsule + cylinder
	static setRadius(object: Object3D, value: number) {
		this._setNumber(object, PhysicsRBDSphereAttribute.RADIUS, value);
	}
	static getRadius(object: Object3D) {
		return this._getNumber(object, PhysicsRBDSphereAttribute.RADIUS);
	}
	// capsule + cylinder
	static setHeight(object: Object3D, value: number) {
		this._setNumber(object, PhysicsRBDCapsuleAttribute.HEIGHT, value);
	}
	static getHeight(object: Object3D) {
		return this._getNumber(object, PhysicsRBDCapsuleAttribute.HEIGHT);
	}
}
