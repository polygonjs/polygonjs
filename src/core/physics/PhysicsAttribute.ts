import {Vector3} from 'three';
import {PhysicsJointAttribute} from './PhysicsJoint';
import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {
	setObjectVector3,
	getObjectVector3,
	setObjectNumber,
	getObjectNumber,
	setObjectBoolean,
	getObjectBoolean,
	getObjectString,
	setObjectString,
} from '../geometry/AttributeUtils';
import {CoreObject} from '../geometry/modules/three/CoreObject';

export enum PhysicsIdAttribute {
	WORLD = 'PhysicsIdAttribute_worldId',
	RBD_HANDLE = 'PhysicsIdAttribute_rbdHandle',
	DEBUG_WORLD = 'PhysicsIdAttribute_debugWorldId',
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

export class CorePhysicsAttribute {
	static setRBDHandle(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsIdAttribute.RBD_HANDLE, value);
	}
	static getRBDHandle(object: ObjectContent<CoreObjectType>): number {
		return getObjectNumber(object, PhysicsIdAttribute.RBD_HANDLE, -1);
	}
	static deleteRBDHandle(object: ObjectContent<CoreObjectType>): void {
		CoreObject.deleteAttribute(object, PhysicsIdAttribute.RBD_HANDLE);
	}
	// common
	static setRBDId(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, PhysicsCommonAttribute.RBD_ID, value);
	}
	static getRBDId(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, PhysicsCommonAttribute.RBD_ID) as string;
	}
	static setRBDType(object: ObjectContent<CoreObjectType>, value: PhysicsRBDType) {
		setObjectString(object, PhysicsCommonAttribute.RBD_TYPE, value);
	}
	static getRBDType(object: ObjectContent<CoreObjectType>): PhysicsRBDType | undefined {
		return getObjectString(object, PhysicsCommonAttribute.RBD_TYPE) as PhysicsRBDType | undefined;
	}
	static setColliderType(object: ObjectContent<CoreObjectType>, value: PhysicsRBDColliderType) {
		setObjectString(object, PhysicsCommonAttribute.COLLIDER_TYPE, value);
	}
	static getColliderType(object: ObjectContent<CoreObjectType>): PhysicsRBDColliderType | undefined {
		return getObjectString(object, PhysicsCommonAttribute.COLLIDER_TYPE) as PhysicsRBDColliderType | undefined;
	}
	static setCanSleep(object: ObjectContent<CoreObjectType>, value: boolean) {
		setObjectBoolean(object, PhysicsCommonAttribute.CAN_SLEEP, value);
	}
	static getCanSleep(object: ObjectContent<CoreObjectType>) {
		return getObjectBoolean(object, PhysicsCommonAttribute.CAN_SLEEP, true);
	}
	static setDensity(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.DENSITY, value);
	}
	static getDensity(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsCommonAttribute.DENSITY, 1);
	}
	static setRestitution(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.RESTITUTION, value);
	}
	static getRestitution(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsCommonAttribute.RESTITUTION, 0.5);
	}
	static setFriction(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.FRICTION, value);
	}
	static getFriction(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsCommonAttribute.FRICTION, 0);
	}
	static setLinearDamping(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.LINEAR_DAMPING, value);
	}
	static getLinearDamping(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsCommonAttribute.LINEAR_DAMPING, 0);
	}
	static setAngularDamping(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.ANGULAR_DAMPING, value);
	}
	static getAngularDamping(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsCommonAttribute.ANGULAR_DAMPING, 0);
	}
	static setLinearVelocity(object: ObjectContent<CoreObjectType>, value: Vector3) {
		setObjectVector3(object, PhysicsCommonAttribute.LINEAR_VELOCITY, value);
	}
	static getLinearVelocity(object: ObjectContent<CoreObjectType>, target: Vector3) {
		return getObjectVector3(object, PhysicsCommonAttribute.LINEAR_VELOCITY, target);
	}
	static setAngularVelocity(object: ObjectContent<CoreObjectType>, value: Vector3) {
		setObjectVector3(object, PhysicsCommonAttribute.ANGULAR_VELOCITY, value);
	}
	static getAngularVelocity(object: ObjectContent<CoreObjectType>, target: Vector3) {
		return getObjectVector3(object, PhysicsCommonAttribute.ANGULAR_VELOCITY, target);
	}
	static setGravityScale(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.GRAVITY_SCALE, value);
	}
	static getGravityScale(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsCommonAttribute.GRAVITY_SCALE, 0);
	}

	// shapes
	static setBorderRadius(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.BORDER_RADIUS, value);
	}
	static getBorderRadius(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsCommonAttribute.BORDER_RADIUS, 0);
	}

	// cuboid
	static setCuboidSizes(object: ObjectContent<CoreObjectType>, value: Vector3) {
		setObjectVector3(object, PhysicsRBDCuboidAttribute.SIZES, value);
	}
	static getCuboidSizes(object: ObjectContent<CoreObjectType>, value: Vector3) {
		getObjectVector3(object, PhysicsRBDCuboidAttribute.SIZES, value);
	}
	static setCuboidSize(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsRBDCuboidAttribute.SIZE, value);
	}
	static getCuboidSize(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsRBDCuboidAttribute.SIZE, 1);
	}
	// sphere + capsule + cylinder
	static setRadius(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsRBDRadiusAttribute.RADIUS, value);
	}
	static getRadius(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsRBDRadiusAttribute.RADIUS, 1);
	}
	// capsule + cylinder
	static setHeight(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsRBDHeightAttribute.HEIGHT, value);
	}
	static getHeight(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsRBDHeightAttribute.HEIGHT, 1);
	}
	// heightfield
	static setHeightFieldRows(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsRBDHeightFieldAttribute.HEIGHT_FIELD_ROWS, value);
	}
	static getHeightFieldRows(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsRBDHeightFieldAttribute.HEIGHT_FIELD_ROWS, 2);
	}
	static setHeightFieldCols(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsRBDHeightFieldAttribute.HEIGHT_FIELD_COLS, value);
	}
	static getHeightFieldCols(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, PhysicsRBDHeightFieldAttribute.HEIGHT_FIELD_COLS, 2);
	}
	// character controller
	static setCharacterControllerId(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_ID, value);
	}
	static getCharacterControllerId(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_ID) as string;
	}
	static setCharacterControllerOffset(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_OFFSET, value);
	}
	static getCharacterControllerOffset(object: ObjectContent<CoreObjectType>): number {
		return getObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_OFFSET, 0.01) as number;
	}
	static setCharacterControllerUp(object: ObjectContent<CoreObjectType>, value: Vector3) {
		setObjectVector3(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_UP, value);
	}
	static getCharacterControllerUp(object: ObjectContent<CoreObjectType>, target: Vector3) {
		return getObjectVector3(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_UP, target);
	}
	static setCharacterControllerMaxSlopeClimbAngle(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_MAX_SLOPE_CLIMB_ANGLE, value);
	}
	static getCharacterControllerMaxSlopeClimbAngle(object: ObjectContent<CoreObjectType>): number {
		return getObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_MAX_SLOPE_CLIMB_ANGLE, 0) as number;
	}
	static setCharacterControllerMinSlopeSlideAngle(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_MIN_SLOPE_CLIMB_ANGLE, value);
	}
	static getCharacterControllerMinSlopeSlideAngle(object: ObjectContent<CoreObjectType>): number {
		return getObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_MIN_SLOPE_CLIMB_ANGLE, 0) as number;
	}
	static setCharacterControllerApplyImpulsesToDynamic(object: ObjectContent<CoreObjectType>, value: boolean) {
		setObjectBoolean(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_APPLY_IMPULSES_TO_DYNAMIC, value);
	}
	static getCharacterControllerApplyImpulsesToDynamic(object: ObjectContent<CoreObjectType>): boolean {
		return getObjectBoolean(
			object,
			PhysicsCommonAttribute.CHARACTER_CONTROLLER_APPLY_IMPULSES_TO_DYNAMIC,
			false
		) as boolean;
	}
	static setCharacterControllerSnapToGroundDistance(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_SNAP_TO_GROUND_DISTANCE, value);
	}
	static getCharacterControllerSnapToGroundDistance(object: ObjectContent<CoreObjectType>): number {
		return getObjectNumber(
			object,
			PhysicsCommonAttribute.CHARACTER_CONTROLLER_SNAP_TO_GROUND_DISTANCE,
			0
		) as number;
	}
	// auto step
	static setCharacterControllerAutoStepMaxHeight(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_MAX_HEIGHT, value);
	}
	static getCharacterControllerAutoStepMaxHeight(object: ObjectContent<CoreObjectType>): number {
		return getObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_MAX_HEIGHT, 0) as number;
	}
	static setCharacterControllerAutoStepMinWidth(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_MIN_WIDTH, value);
	}
	static getCharacterControllerAutoStepMinWidth(object: ObjectContent<CoreObjectType>): number {
		return getObjectNumber(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_MIN_WIDTH, 0) as number;
	}
	static setCharacterControllerAutoStepOnDynamic(object: ObjectContent<CoreObjectType>, value: boolean) {
		setObjectBoolean(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_ON_DYNAMIC, value);
	}
	static getCharacterControllerAutoStepOnDynamic(object: ObjectContent<CoreObjectType>): boolean {
		return getObjectBoolean(
			object,
			PhysicsCommonAttribute.CHARACTER_CONTROLLER_AUTO_STEP_ON_DYNAMIC,
			false
		) as boolean;
	}
	// camera
	static setCharacterControllerCameraPath(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_CAMERA_OBJECT_PATH, value);
	}
	static getCharacterControllerCameraPath(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, PhysicsCommonAttribute.CHARACTER_CONTROLLER_CAMERA_OBJECT_PATH) as string;
	}
}
