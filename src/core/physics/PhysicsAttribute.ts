import {BaseCoreObject} from '../geometry/_BaseObject';
import {CoreObject} from '../geometry/Object';
import {Vector4, Vector3, Vector2} from 'three';
import {PhysicsJointAttribute} from './PhysicsJoint';
import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';

export enum PhysicsIdAttribute {
	WORLD = 'PhysicsIdAttribute_worldId',
	RBD = 'PhysicsIdAttribute_rbdId',
	DEBUG = 'PhysicsIdAttribute_debugId',
}
export enum PhysicsRBDType {
	FIXED = 'fixed',
	DYNAMIC = 'dynamic',
	KINEMATIC_VEL = 'kinematicVelocityBased',
	KINEMATIC_POS = 'kinematicPositionBased',
}
export const PHYSICS_RBD_TYPES: PhysicsRBDType[] = [
	PhysicsRBDType.FIXED,
	PhysicsRBDType.DYNAMIC,
	PhysicsRBDType.KINEMATIC_POS,
	PhysicsRBDType.KINEMATIC_VEL,
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
	HEIGHT_FIELD = 'heightField',
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
	PhysicsRBDColliderType.HEIGHT_FIELD,
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
	PhysicsRBDColliderType.HEIGHT_FIELD,
];
export const PHYSICS_RBD_COLLIDER_TYPE_MENU_ENTRIES = SORTED_ENTRIES.map((entry) => {
	return {name: entry, value: PHYSICS_RBD_COLLIDER_TYPES.indexOf(entry)};
});

export enum PhysicsRBDCuboidAttribute {
	SIZES = 'sizes',
	SIZE = 'size',
}
export enum PhysicsRBDRadiusAttribute {
	RADIUS = 'radius',
}
export enum PhysicsRBDHeightAttribute {
	HEIGHT = 'height',
}
export enum PhysicsRBDCylinderAttribute {
	HEIGHT = 'height',
}
export enum PhysicsRBDHeightFieldAttribute {
	HEIGHT_FIELD_ROWS = 'heightFieldRows',
	HEIGHT_FIELD_COLS = 'heightFieldCols',
}

export enum PhysicsCommonAttribute {
	RBD_ID = 'RBDId',
	RBD_TYPE = 'RBDType',
	COLLIDER_TYPE = 'RBDColliderType',
	//
	BORDER_RADIUS = 'borderRadius',
	CAN_SLEEP = 'RBDCanSleep',
	DENSITY = 'density',
	RESTITUTION = 'restitution',
	FRICTION = 'friction',
	LINEAR_DAMPING = 'linearDamping',
	ANGULAR_DAMPING = 'angularDamping',
	LINEAR_VELOCITY = 'linearVelocity',
	ANGULAR_VELOCITY = 'angularVelocity',
	GRAVITY_SCALE = 'gravityScale',
	//
	CHARACTER_CONTROLLER_ID = 'characterControllerId',
	CHARACTER_CONTROLLER_OFFSET = 'characterControllerOffset',
	CHARACTER_CONTROLLER_APPLY_IMPULSES_TO_DYNAMIC = 'characterControllerApplyImpulsesToDynamic',
	CHARACTER_CONTROLLER_SNAP_TO_GROUND_DISTANCE = 'characterControllerSnapToGroundDistance',
	CHARACTER_CONTROLLER_AUTO_STEP_MAX_HEIGHT = 'characterControllerAutoStepMaxHeight',
	CHARACTER_CONTROLLER_AUTO_STEP_MIN_WIDTH = 'characterControllerAutoStepMinWidth',
	CHARACTER_CONTROLLER_AUTO_STEP_ON_DYNAMIC = 'characterControllerAutoStepOnDynamic',
	CHARACTER_CONTROLLER_MAX_SLOPE_CLIMB_ANGLE = 'characterControllerMaxSlopeClimbAngle',
	CHARACTER_CONTROLLER_MIN_SLOPE_CLIMB_ANGLE = 'characterControllerMinSlopeSlideAngle',
	CHARACTER_CONTROLLER_UP = 'characterControllerUp',
	CHARACTER_CONTROLLER_CAMERA_OBJECT_PATH = 'characterControllerCameraObjectPath',
}
type PhysicsAttribute =
	| PhysicsCommonAttribute
	| PhysicsRBDCuboidAttribute
	| PhysicsRBDRadiusAttribute
	| PhysicsRBDHeightAttribute
	| PhysicsRBDHeightFieldAttribute
	| PhysicsJointAttribute;

export function physicsAttribNameLive(attribute: PhysicsAttribute): string {
	// return attribute;
	return `${attribute}-live`;
}

export class CorePhysicsBaseAttribute {
	protected static _setVector4(object: ObjectContent<CoreObjectType>, attribName: PhysicsAttribute, value: Vector4) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getVector4(object: ObjectContent<CoreObjectType>, attribName: PhysicsAttribute, target: Vector4) {
		CoreObject.attribValue(object, attribName, 0, target);
	}
	protected static _setVector3(object: ObjectContent<CoreObjectType>, attribName: PhysicsAttribute, value: Vector3) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getVector3(object: ObjectContent<CoreObjectType>, attribName: PhysicsAttribute, target: Vector3) {
		CoreObject.attribValue(object, attribName, 0, target);
	}
	protected static _setVector2(object: ObjectContent<CoreObjectType>, attribName: PhysicsAttribute, value: Vector2) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getVector2(object: ObjectContent<CoreObjectType>, attribName: PhysicsAttribute, target: Vector2) {
		CoreObject.attribValue(object, attribName, 0, target);
	}
	protected static _setNumber(object: ObjectContent<CoreObjectType>, attribName: PhysicsAttribute, value: number) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _setBoolean(object: ObjectContent<CoreObjectType>, attribName: PhysicsAttribute, value: boolean) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getNumber(
		object: ObjectContent<CoreObjectType>,
		attribName: PhysicsAttribute,
		defaultValue: number
	): number {
		const val = CoreObject.attribValue(object, attribName, 0) as number | undefined;
		if (val == null) {
			return defaultValue;
		}
		return val;
	}
	protected static _getBoolean(
		object: ObjectContent<CoreObjectType>,
		attribName: PhysicsAttribute,
		defaultValue: boolean
	): boolean {
		const val = CoreObject.attribValue(object, attribName, 0) as boolean | undefined;
		if (val == null) {
			return defaultValue;
		}
		return val;
	}
	protected static _setString(object: ObjectContent<CoreObjectType>, attribName: PhysicsAttribute, value: string) {
		BaseCoreObject.addAttribute(object, attribName, value);
	}
	protected static _getString(
		object: ObjectContent<CoreObjectType>,
		attribName: PhysicsAttribute
	): string | undefined {
		return BaseCoreObject.attribValue(object, attribName, 0) as string | undefined;
	}
}

export class CorePhysicsAttribute extends CorePhysicsBaseAttribute {
	// common
	static setRBDId(object: ObjectContent<CoreObjectType>, value: string) {
		this._setString(object, PhysicsCommonAttribute.RBD_ID, value);
	}
	static getRBDId(object: ObjectContent<CoreObjectType>): string {
		return this._getString(object, PhysicsCommonAttribute.RBD_ID) as string;
	}
	static setRBDType(object: ObjectContent<CoreObjectType>, value: PhysicsRBDType) {
		this._setString(object, PhysicsCommonAttribute.RBD_TYPE, value);
	}
	static getRBDType(object: ObjectContent<CoreObjectType>): PhysicsRBDType | undefined {
		return this._getString(object, PhysicsCommonAttribute.RBD_TYPE) as PhysicsRBDType | undefined;
	}
	static setColliderType(object: ObjectContent<CoreObjectType>, value: PhysicsRBDColliderType) {
		this._setString(object, PhysicsCommonAttribute.COLLIDER_TYPE, value);
	}
	static getColliderType(object: ObjectContent<CoreObjectType>): PhysicsRBDColliderType | undefined {
		return this._getString(object, PhysicsCommonAttribute.COLLIDER_TYPE) as PhysicsRBDColliderType | undefined;
	}
	static setCanSleep(object: ObjectContent<CoreObjectType>, value: boolean) {
		this._setBoolean(object, PhysicsCommonAttribute.CAN_SLEEP, value);
	}
	static getCanSleep(object: ObjectContent<CoreObjectType>) {
		return this._getBoolean(object, PhysicsCommonAttribute.CAN_SLEEP, true);
	}
	static setDensity(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.DENSITY, value);
	}
	static getDensity(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsCommonAttribute.DENSITY, 1);
	}
	static setRestitution(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.RESTITUTION, value);
	}
	static getRestitution(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsCommonAttribute.RESTITUTION, 0.5);
	}
	static setFriction(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.FRICTION, value);
	}
	static getFriction(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsCommonAttribute.FRICTION, 0);
	}
	static setLinearDamping(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.LINEAR_DAMPING, value);
	}
	static getLinearDamping(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsCommonAttribute.LINEAR_DAMPING, 0);
	}
	static setAngularDamping(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.ANGULAR_DAMPING, value);
	}
	static getAngularDamping(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsCommonAttribute.ANGULAR_DAMPING, 0);
	}
	static setLinearVelocity(object: ObjectContent<CoreObjectType>, value: Vector3) {
		this._setVector3(object, PhysicsCommonAttribute.LINEAR_VELOCITY, value);
	}
	static getLinearVelocity(object: ObjectContent<CoreObjectType>, target: Vector3) {
		return this._getVector3(object, PhysicsCommonAttribute.LINEAR_VELOCITY, target);
	}
	static setAngularVelocity(object: ObjectContent<CoreObjectType>, value: Vector3) {
		this._setVector3(object, PhysicsCommonAttribute.ANGULAR_VELOCITY, value);
	}
	static getAngularVelocity(object: ObjectContent<CoreObjectType>, target: Vector3) {
		return this._getVector3(object, PhysicsCommonAttribute.ANGULAR_VELOCITY, target);
	}
	static setGravityScale(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.GRAVITY_SCALE, value);
	}
	static getGravityScale(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsCommonAttribute.GRAVITY_SCALE, 0);
	}

	// shapes
	static setBorderRadius(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.BORDER_RADIUS, value);
	}
	static getBorderRadius(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsCommonAttribute.BORDER_RADIUS, 0);
	}

	// cuboid
	static setCuboidSizes(object: ObjectContent<CoreObjectType>, value: Vector3) {
		this._setVector3(object, PhysicsRBDCuboidAttribute.SIZES, value);
	}
	static getCuboidSizes(object: ObjectContent<CoreObjectType>, value: Vector3) {
		this._getVector3(object, PhysicsRBDCuboidAttribute.SIZES, value);
	}
	static setCuboidSize(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsRBDCuboidAttribute.SIZE, value);
	}
	static getCuboidSize(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsRBDCuboidAttribute.SIZE, 1);
	}
	// sphere + capsule + cylinder
	static setRadius(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsRBDRadiusAttribute.RADIUS, value);
	}
	static getRadius(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsRBDRadiusAttribute.RADIUS, 1);
	}
	// capsule + cylinder
	static setHeight(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsRBDHeightAttribute.HEIGHT, value);
	}
	static getHeight(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsRBDHeightAttribute.HEIGHT, 1);
	}
	// heightfield
	static setHeightFieldRows(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsRBDHeightFieldAttribute.HEIGHT_FIELD_ROWS, value);
	}
	static getHeightFieldRows(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsRBDHeightFieldAttribute.HEIGHT_FIELD_ROWS, 2);
	}
	static setHeightFieldCols(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsRBDHeightFieldAttribute.HEIGHT_FIELD_COLS, value);
	}
	static getHeightFieldCols(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, PhysicsRBDHeightFieldAttribute.HEIGHT_FIELD_COLS, 2);
	}
	// character controller
	static setCharacterControllerId(object: ObjectContent<CoreObjectType>, value: string) {
		this._setString(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_ID, value);
	}
	static getCharacterControllerId(object: ObjectContent<CoreObjectType>): string {
		return this._getString(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_ID) as string;
	}
	static setCharacterControllerOffset(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_OFFSET, value);
	}
	static getCharacterControllerOffset(object: ObjectContent<CoreObjectType>): number {
		return this._getNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_OFFSET, 0.01) as number;
	}
	static setCharacterControllerUp(object: ObjectContent<CoreObjectType>, value: Vector3) {
		this._setVector3(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_UP, value);
	}
	static getCharacterControllerUp(object: ObjectContent<CoreObjectType>, target: Vector3) {
		return this._getVector3(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_UP, target);
	}
	static setCharacterControllerMaxSlopeClimbAngle(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_MAX_SLOPE_CLIMB_ANGLE, value);
	}
	static getCharacterControllerMaxSlopeClimbAngle(object: ObjectContent<CoreObjectType>): number {
		return this._getNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_MAX_SLOPE_CLIMB_ANGLE, 0) as number;
	}
	static setCharacterControllerMinSlopeSlideAngle(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_MIN_SLOPE_CLIMB_ANGLE, value);
	}
	static getCharacterControllerMinSlopeSlideAngle(object: ObjectContent<CoreObjectType>): number {
		return this._getNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_MIN_SLOPE_CLIMB_ANGLE, 0) as number;
	}
	static setCharacterControllerApplyImpulsesToDynamic(object: ObjectContent<CoreObjectType>, value: boolean) {
		this._setBoolean(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_APPLY_IMPULSES_TO_DYNAMIC, value);
	}
	static getCharacterControllerApplyImpulsesToDynamic(object: ObjectContent<CoreObjectType>): boolean {
		return this._getBoolean(
			object,
			PhysicsCommonAttribute.CHARACTER_CONTROLLER_APPLY_IMPULSES_TO_DYNAMIC,
			false
		) as boolean;
	}
	static setCharacterControllerSnapToGroundDistance(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_SNAP_TO_GROUND_DISTANCE, value);
	}
	static getCharacterControllerSnapToGroundDistance(object: ObjectContent<CoreObjectType>): number {
		return this._getNumber(
			object,
			PhysicsCommonAttribute.CHARACTER_CONTROLLER_SNAP_TO_GROUND_DISTANCE,
			0
		) as number;
	}
	// auto step
	static setCharacterControllerAutoStepMaxHeight(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_MAX_HEIGHT, value);
	}
	static getCharacterControllerAutoStepMaxHeight(object: ObjectContent<CoreObjectType>): number {
		return this._getNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_MAX_HEIGHT, 0) as number;
	}
	static setCharacterControllerAutoStepMinWidth(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_MIN_WIDTH, value);
	}
	static getCharacterControllerAutoStepMinWidth(object: ObjectContent<CoreObjectType>): number {
		return this._getNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_MIN_WIDTH, 0) as number;
	}
	static setCharacterControllerAutoStepOnDynamic(object: ObjectContent<CoreObjectType>, value: boolean) {
		this._setBoolean(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_ON_DYNAMIC, value);
	}
	static getCharacterControllerAutoStepOnDynamic(object: ObjectContent<CoreObjectType>): boolean {
		return this._getBoolean(
			object,
			PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_ON_DYNAMIC,
			false
		) as boolean;
	}
	// camera
	static setCharacterControllerCameraPath(object: ObjectContent<CoreObjectType>, value: string) {
		this._setString(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_CAMERA_OBJECT_PATH, value);
	}
	static getCharacterControllerCameraPath(object: ObjectContent<CoreObjectType>): string {
		return this._getString(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_CAMERA_OBJECT_PATH) as string;
	}
}
