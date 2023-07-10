import {TypeAssert} from './../../engine/poly/Assert';
// import {CorePhysicsUserData} from './PhysicsUserData';
import {PhysicsRBDColliderType, PhysicsRBDType, CorePhysicsAttribute} from './PhysicsAttribute';
import {Object3D, Vector3, Quaternion} from 'three';
import {World, RigidBodyType, RigidBodyDesc, RigidBody, ColliderDesc} from '@dimforge/rapier3d-compat';
import {CorePhysicsLoaded, PhysicsLib, Object3DByRididBody} from './CorePhysics';
import {createPhysicsSphere} from './shapes/RBDSphere';
import {createPhysicsCuboid} from './shapes/RBDCuboid';
import {createPhysicsCapsule} from './shapes/RBDCapsule';
import {createPhysicsCone} from './shapes/RBDCone';
import {createPhysicsCylinder} from './shapes/RBDCylinder';
import {createPhysicsTriMesh} from './shapes/RBDTrimesh';
import {createPhysicsConvexHull} from './shapes/ConvexHull';
import {createPhysicsHeightField} from './shapes/HeightField';
import {touchRBDProperties, touchRBDProperty} from '../reactivity/RBDPropertyReactivity';
import {OBJECT_TRANSFORM_PROPERTIES, touchObjectProperties} from '../reactivity/ObjectPropertyReactivity';
import {PolyScene} from '../../engine/scene/PolyScene';
import {removeFromParent} from '../../engine/poly/PolyOnObjectsAddRemoveHooksController';

export enum RBDProperty {
	ANGULAR_VELOCITY = 'angVel',
	LINEAR_VELOCITY = 'linVel',
	POSITION = 'position',
	ROTATION = 'rotation',
	LINEAR_DAMPING = 'linearDamping',
	ANGULAR_DAMPING = 'angularDamping',
	IS_SLEEPING = 'isSleeping',
	IS_MOVING = 'isMoving',
}

const tmpV3 = new Vector3();
// const q1 = new Quaternion();
// const q2 = new Quaternion();
const currentPos = new Vector3();
const currentLinearVelocity = new Vector3();
const currentAngularVelocity = new Vector3();
const newPos = new Vector3();
const newLinearVelocity = new Vector3();
const newAngularVelocity = new Vector3();
const currentQuaternion = new Quaternion();
const newQuaternion = new Quaternion();
const linearVelocity = new Vector3();
const angularVelocity = new Vector3();

interface CollidescObjectPair {
	object: Object3D;
	colliderDesc: ColliderDesc;
}

const physicsRBDByRBDHandle: Map<number, RigidBody> = new Map();
const physicsRBDByRBDId: Map<string, RigidBody> = new Map();
const worldByRBD: WeakMap<RigidBody, World> = new WeakMap();

function _createRBDFromDescAndId(world: World, rigidBodyDesc: RigidBodyDesc, rbdId: string) {
	const rigidBody = world.createRigidBody(rigidBodyDesc);
	const handle = rigidBody.handle;
	worldByRBD.set(rigidBody, world);
	physicsRBDByRBDHandle.set(handle, rigidBody);
	physicsRBDByRBDId.set(rbdId, rigidBody);
	return rigidBody;
}
function _createRBDFromDescAndObject(world: World, rigidBodyDesc: RigidBodyDesc, object: Object3D) {
	const rbdId = CorePhysicsAttribute.getRBDId(object);
	const rigidBody = _createRBDFromDescAndId(world, rigidBodyDesc, rbdId);
	CorePhysicsAttribute.setRBDHandle(object, rigidBody.handle);
	return rigidBody;
}
interface CreateRBDFromAttributesOptions {
	PhysicsLib: PhysicsLib;
	world: World;
	object: Object3D;
	rigidBodyById: Map<string, RigidBody>;
	objectsByRigidBody: Object3DByRididBody;
}
function _createRBDFromAttributes(options: CreateRBDFromAttributesOptions) {
	const {PhysicsLib, world, object, rigidBodyById, objectsByRigidBody} = options;
	const type = CorePhysicsAttribute.getRBDType(object);
	if (type == null) {
		return;
	}
	const rbdType: RigidBodyType | undefined = PhysicsRBDTypeToRigidBodyType(type);
	if (rbdType == null) {
		return;
	}

	// get attributes
	const linearDamping = CorePhysicsAttribute.getLinearDamping(object);
	const angularDamping = CorePhysicsAttribute.getAngularDamping(object);
	linearVelocity.set(0, 0, 0);
	angularVelocity.set(0, 0, 0);
	CorePhysicsAttribute.getLinearVelocity(object, linearVelocity);
	CorePhysicsAttribute.getAngularVelocity(object, angularVelocity);
	const gravityScale = CorePhysicsAttribute.getGravityScale(object);
	const canSleep = CorePhysicsAttribute.getCanSleep(object);

	// create desc
	const rigidBodyDesc = new PhysicsLib.RigidBodyDesc(rbdType);
	rigidBodyDesc.setTranslation(object.position.x, object.position.y, object.position.z);
	rigidBodyDesc.setRotation(object.quaternion);
	rigidBodyDesc.setLinvel(linearVelocity.x, linearVelocity.y, linearVelocity.z);
	rigidBodyDesc.setAngvel(angularVelocity);
	if (linearDamping != null) {
		rigidBodyDesc.setLinearDamping(linearDamping);
	}
	if (angularDamping != null) {
		rigidBodyDesc.setAngularDamping(angularDamping);
	}
	if (gravityScale != null) {
		// .setGravityScale seems to work when set on the rbd desc,
		// but not on the RBD itself
		rigidBodyDesc.setGravityScale(gravityScale);
	}
	if (canSleep != null) {
		rigidBodyDesc.setCanSleep(canSleep);
	}

	// create RBD
	const rigidBody = _createRBDFromDescAndObject(world, rigidBodyDesc, object);
	objectsByRigidBody.set(rigidBody, object);
	const rbdId = CorePhysicsAttribute.getRBDId(object);
	if (rbdId) {
		rigidBodyById.set(rbdId, rigidBody);
	}
	return rigidBody;
}
function _createColliderDesc(PhysicsLib: PhysicsLib, object: Object3D) {
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (!(colliderType != null)) {
		return;
	}
	const colliderDesc = PhysicsRBDCollider(PhysicsLib, colliderType, object);
	if (!colliderDesc) {
		console.error('no collider', object);
		return;
	}
	const restitution = CorePhysicsAttribute.getRestitution(object);
	const friction = CorePhysicsAttribute.getFriction(object);
	const density = CorePhysicsAttribute.getDensity(object);
	if (restitution != null) {
		colliderDesc.setRestitution(restitution);
	}
	if (friction != null) {
		colliderDesc.setFriction(friction);
	}
	if (density != null) {
		colliderDesc.setDensity(density);
	}
	return colliderDesc;
}
export function _getRBD(object: Object3D) {
	const handle = CorePhysicsAttribute.getRBDHandle(object);
	if (handle == null) {
		return;
	}
	return physicsRBDByRBDHandle.get(handle);
}
export function _getPhysicsWorldFromRBD(object: Object3D) {
	const rbd = _getRBD(object);
	if (!rbd) {
		return;
	}
	return worldByRBD.get(rbd);
}

export function _physicsRBDDelete(scene: PolyScene, object: Object3D) {
	const handle = CorePhysicsAttribute.getRBDHandle(object);
	if (handle == null) {
		return;
	}
	const body = physicsRBDByRBDHandle.get(handle);
	if (!body) {
		return;
	}
	const world = worldByRBD.get(body);
	if (!world) {
		return;
	}
	world.removeRigidBody(body);
	worldByRBD.delete(body);
	physicsRBDByRBDHandle.delete(handle);
	CorePhysicsAttribute.deleteRBDHandle(object);
	removeFromParent(scene, object);
}

interface PhysicsCreateRBDOptions {
	PhysicsLib: PhysicsLib;
	world: World;
	object: Object3D;
	rigidBodyById: Map<string, RigidBody>;
	objectsByRigidBody: Object3DByRididBody;
}
export function physicsCreateRBD(options: PhysicsCreateRBDOptions) {
	const {PhysicsLib, world, object, rigidBodyById, objectsByRigidBody} = options;
	const rigidBody = _createRBDFromAttributes({PhysicsLib, world, object, rigidBodyById, objectsByRigidBody});
	if (!rigidBody) {
		// if not rbd created, we go through the children
		for (let child of object.children) {
			physicsCreateRBD({PhysicsLib, world, rigidBodyById, objectsByRigidBody, object: child});
		}

		return;
	}

	let childrenColliderDesc: CollidescObjectPair[] | undefined;
	if (object.children.length > 0) {
		object.traverse((child) => {
			if (child != object) {
				const childColliderDesc = _createColliderDesc(PhysicsLib, child);
				if (childColliderDesc) {
					childrenColliderDesc = childrenColliderDesc || [];
					childrenColliderDesc.push({object: child, colliderDesc: childColliderDesc});
				}
			}
		});
	}

	const colliderDesc = _createColliderDesc(PhysicsLib, object);
	if (!(colliderDesc || childrenColliderDesc)) {
		return;
	}
	if (colliderDesc) {
		world.createCollider(colliderDesc, rigidBody);
	}
	if (childrenColliderDesc) {
		// we must not alterate the hierarchy here,
		// as it messes up with orders of children
		// let currentParent = object.parent;
		// currentParent?.remove(object);
		// object.getWorldQuaternion(q1);
		for (let childCollider of childrenColliderDesc) {
			const collider = world.createCollider(childCollider.colliderDesc, rigidBody);

			// t
			tmpV3.copy(childCollider.object.position);
			childCollider.object.localToWorld(tmpV3);
			object.worldToLocal(tmpV3);
			collider.setTranslationWrtParent(tmpV3);

			// r
			// TODO: here we are only getting the quaternion of the object,
			// not its quaternion relative to the parent.
			// It works if it is a direct child, but will fail with a deeper hierarchy
			// let currentChildParent = childCollider.object.parent;
			// object.attach(childCollider.object);
			// object.matrix.decompose(t, q, s);
			// it seems that computing .getWorldQuaternion
			// messes up with .quaternion
			// object.getWorldQuaternion(q1);
			// childCollider.object.getWorldQuaternion(q2);
			// q1.invert().multiply(q2);
			// q2.multiply(q1.invert());
			collider.setRotationWrtParent(childCollider.object.quaternion);
			// currentChildParent?.attach(childCollider.object);
		}
		// currentParent?.add(object);
	}
}

export function physicsUpdateRBD(object: Object3D, rigidBody: RigidBody) {
	// physicsRBDSetInitMatrix(object);
	const position = rigidBody.translation();
	const rotation = rigidBody.rotation();
	object.position.set(position.x, position.y, position.z);
	object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
	object.updateMatrix();
	updateRBDRefs(object);
}
const SIM_PROPERTIES = [
	RBDProperty.ANGULAR_VELOCITY,
	RBDProperty.LINEAR_VELOCITY,
	RBDProperty.POSITION,
	RBDProperty.ROTATION,
	RBDProperty.IS_SLEEPING,
	RBDProperty.IS_MOVING,
];
function updateRBDRefs(object: Object3D) {
	touchRBDProperties(object, SIM_PROPERTIES);
	touchObjectProperties(object, OBJECT_TRANSFORM_PROPERTIES);
}

// impulse
export function _physicsRBDApplyImpulse(object: Object3D, impulse: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.applyImpulse(impulse, true);
}
export function _physicsRBDApplyImpulseAtPoint(object: Object3D, impulse: Vector3, point: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.applyImpulseAtPoint(impulse, point, true);
}
export function _physicsRBDApplyTorqueImpulse(object: Object3D, impulse: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.applyTorqueImpulse(impulse, true);
}
// add
export function _physicsRBDAddForce(object: Object3D, force: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.addForce(force, true);
}
export function _physicsRBDAddForceAtPoint(object: Object3D, force: Vector3, point: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.addForceAtPoint(force, point, true);
}
export function _physicsRBDAddTorque(object: Object3D, torque: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.addTorque(torque, true);
}
// reset
export function _physicsRBDResetAll(object: Object3D, wakeup: boolean) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.resetForces(wakeup);
	body.resetTorques(wakeup);
	body.setLinvel({x: 0, y: 0, z: 0}, wakeup);
	body.setAngvel({x: 0, y: 0, z: 0}, wakeup);
}
export function _physicsRBDResetForces(object: Object3D, wakeup: boolean) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.resetForces(wakeup);
}
export function _physicsRBDResetTorques(object: Object3D, wakeup: boolean) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.resetTorques(wakeup);
}

export function _setPhysicsRBDPosition(object: Object3D, targetPosition: Vector3, lerp: number) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const translateFunc = body.isKinematic()
		? body.setNextKinematicTranslation.bind(body)
		: body.setTranslation.bind(body);

	if (lerp < 1) {
		const rbdPosition = body.translation();
		currentPos.set(rbdPosition.x, rbdPosition.y, rbdPosition.z);
		newPos.copy(targetPosition);
		currentPos.lerp(newPos, lerp);
		translateFunc(currentPos, true);
	} else {
		translateFunc(targetPosition, true);
	}
	touchRBDProperty(object, RBDProperty.POSITION);
}
export function _setPhysicsRBDRotation(object: Object3D, targetQuaternion: Quaternion, lerp: number) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const rotateFunc = body.isKinematic() ? body.setNextKinematicRotation.bind(body) : body.setRotation.bind(body);
	if (lerp < 1) {
		const rbdRotation = body.rotation();
		currentQuaternion.set(rbdRotation.x, rbdRotation.y, rbdRotation.z, rbdRotation.w);
		newQuaternion.copy(currentQuaternion);
		currentQuaternion.slerp(newQuaternion, lerp);
		rotateFunc(currentQuaternion, true);
	} else {
		rotateFunc(targetQuaternion, true);
	}
	touchRBDProperty(object, RBDProperty.ROTATION);
}
export function _setPhysicsRBDLinearVelocity(object: Object3D, targetVelocity: Vector3, lerp: number) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}

	if (lerp < 1) {
		const rbdLinearVelocity = body.linvel();
		currentLinearVelocity.set(rbdLinearVelocity.x, rbdLinearVelocity.y, rbdLinearVelocity.z);
		newLinearVelocity.copy(targetVelocity);
		currentLinearVelocity.lerp(newPos, lerp);
		body.setLinvel(currentLinearVelocity, true);
	} else {
		body.setLinvel(targetVelocity, true);
	}
	touchRBDProperty(object, RBDProperty.LINEAR_VELOCITY);
}
export function _setPhysicsRBDAngularVelocity(object: Object3D, targetVelocity: Vector3, lerp: number) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}

	if (lerp < 1) {
		const rbdAngularVelocity = body.angvel();
		currentAngularVelocity.set(rbdAngularVelocity.x, rbdAngularVelocity.y, rbdAngularVelocity.z);
		newAngularVelocity.copy(targetVelocity);
		currentAngularVelocity.lerp(newPos, lerp);
		body.setAngvel(currentAngularVelocity, true);
	} else {
		body.setAngvel(targetVelocity, true);
	}
	touchRBDProperty(object, RBDProperty.ANGULAR_VELOCITY);
}

function PhysicsRBDTypeToRigidBodyType(type: PhysicsRBDType) {
	const RigidBodyType = CorePhysicsLoaded()?.RigidBodyType;
	if (!RigidBodyType) {
		return;
	}
	switch (type) {
		case PhysicsRBDType.FIXED: {
			return RigidBodyType.Fixed;
		}
		case PhysicsRBDType.DYNAMIC: {
			return RigidBodyType.Dynamic;
		}
		case PhysicsRBDType.KINEMATIC_POS: {
			return RigidBodyType.KinematicPositionBased;
		}
		case PhysicsRBDType.KINEMATIC_VEL: {
			return RigidBodyType.KinematicVelocityBased;
		}
	}
	TypeAssert.unreachable(type);
}

function PhysicsRBDCollider(
	PhysicsLib: PhysicsLib,
	colliderType: PhysicsRBDColliderType,
	object: Object3D
): ColliderDesc | null | undefined {
	switch (colliderType) {
		case PhysicsRBDColliderType.CAPSULE: {
			return createPhysicsCapsule(PhysicsLib, object);
		}
		case PhysicsRBDColliderType.CUBOID: {
			return createPhysicsCuboid(PhysicsLib, object);
		}
		case PhysicsRBDColliderType.CONE: {
			return createPhysicsCone(PhysicsLib, object);
		}
		case PhysicsRBDColliderType.CONVEX_HULL: {
			return createPhysicsConvexHull(PhysicsLib, object);
		}
		case PhysicsRBDColliderType.TRIMESH: {
			return createPhysicsTriMesh(PhysicsLib, object);
		}
		case PhysicsRBDColliderType.CYLINDER: {
			return createPhysicsCylinder(PhysicsLib, object);
		}
		case PhysicsRBDColliderType.SPHERE: {
			return createPhysicsSphere(PhysicsLib, object);
		}
		case PhysicsRBDColliderType.HEIGHT_FIELD: {
			return createPhysicsHeightField(PhysicsLib, object);
		}
	}
	TypeAssert.unreachable(colliderType);
}
