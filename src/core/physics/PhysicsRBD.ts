import {TypeAssert} from './../../engine/poly/Assert';
// import {CorePhysicsUserData} from './PhysicsUserData';
import {PhysicsRBDColliderType, PhysicsRBDType, CorePhysicsAttribute, PhysicsIdAttribute} from './PhysicsAttribute';
import {Object3D, Vector3, Quaternion} from 'three';
import type {World, RigidBodyType, RigidBodyDesc, RigidBody, ColliderDesc} from '@dimforge/rapier3d';
import {CorePhysicsLoaded, PhysicsLib} from './CorePhysics';
import {CoreObject} from '../geometry/Object';
import {createPhysicsSphere} from './shapes/RBDSphere';
import {createPhysicsCuboid} from './shapes/RBDCuboid';
import {createPhysicsCapsule} from './shapes/RBDCapsule';
import {createPhysicsCone} from './shapes/RBDCone';
import {createPhysicsCylinder} from './shapes/RBDCylinder';
import {createPhysicsTriMesh} from './shapes/RBDTrimesh';
import {createPhysicsConvexHull} from './shapes/ConvexHull';

const tmpV3 = new Vector3();
// const q1 = new Quaternion();
// const q2 = new Quaternion();
const currentPos = new Vector3();
const newPos = new Vector3();
const currentQuaternion = new Quaternion();
const newQuaternion = new Quaternion();

interface CollidescObjectPair {
	object: Object3D;
	colliderDesc: ColliderDesc;
}

const physicsRBDByRBDId: Map<number, RigidBody> = new Map();
const worldByRBD: WeakMap<RigidBody, World> = new WeakMap();

function _createRBDFromDesc(world: World, rigidBodyDesc: RigidBodyDesc, object: Object3D) {
	const rigidBody = world.createRigidBody(rigidBodyDesc);
	const handle = rigidBody.handle;
	worldByRBD.set(rigidBody, world);
	physicsRBDByRBDId.set(handle, rigidBody);
	CoreObject.addAttribute(object, PhysicsIdAttribute.RBD, handle);
	return rigidBody;
}
function _createRBDFromAttributes(PhysicsLib: PhysicsLib, world: World, object: Object3D) {
	const type = CorePhysicsAttribute.getRBDType(object);
	if (type == null) {
		return;
	}
	const rbdType: RigidBodyType | undefined = PhysicsRBDTypeToRigidBodyType(type);
	if (rbdType == null) {
		return;
	}
	const rigidBodyDesc = new PhysicsLib.RigidBodyDesc(rbdType);
	rigidBodyDesc.setTranslation(object.position.x, object.position.y, object.position.z);
	rigidBodyDesc.setRotation(object.quaternion);
	const rigidBody = _createRBDFromDesc(world, rigidBodyDesc, object);

	const linearDamping = CorePhysicsAttribute.getLinearDamping(object);
	const angularDamping = CorePhysicsAttribute.getAngularDamping(object);
	const canSleep = CorePhysicsAttribute.getCanSleep(object);

	if (linearDamping != null) {
		rigidBody.setLinearDamping(linearDamping);
	}
	if (angularDamping != null) {
		rigidBody.setAngularDamping(angularDamping);
	}
	if (canSleep != null) {
		rigidBodyDesc.setCanSleep(canSleep);
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
	const rbdId = CoreObject.attribValue(object, PhysicsIdAttribute.RBD) as number | undefined;
	if (rbdId == null) {
		return;
	}
	return physicsRBDByRBDId.get(rbdId);
}

export function physicsRBDRemove(object: Object3D) {
	const rbdId = CoreObject.attribValue(object, PhysicsIdAttribute.RBD) as number | undefined;
	if (rbdId == null) {
		return;
	}
	const body = physicsRBDByRBDId.get(rbdId);
	if (!body) {
		return;
	}
	const world = worldByRBD.get(body);
	if (!world) {
		return;
	}
	world.removeRigidBody(body);
	worldByRBD.delete(body);
	physicsRBDByRBDId.delete(rbdId);
	CoreObject.deleteAttribute(object, PhysicsIdAttribute.RBD);
	object.visible = false;
}

export function physicsCreateRBD(PhysicsLib: PhysicsLib, world: World, object: Object3D) {
	const rigidBody = _createRBDFromAttributes(PhysicsLib, world, object);
	if (!rigidBody) {
		return;
	}

	const id = CorePhysicsAttribute.getRBDId(object);
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

	return {rigidBody, id};
}

export function physicsUpdateRBD(object: Object3D) {
	const body = _getRBD(object);
	if (!body) {
		// console.warn('no rbd found');
		return;
	}
	// physicsRBDSetInitMatrix(object);
	const position = body.translation();
	const rotation = body.rotation();
	object.position.set(position.x, position.y, position.z);
	object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
	object.updateMatrix();
}

// impulse
export function physicsRBDApplyImpulse(object: Object3D, impulse: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.applyImpulse(impulse, true);
}
export function physicsRBDApplyImpulseAtPoint(object: Object3D, impulse: Vector3, point: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.applyImpulseAtPoint(impulse, point, true);
}
export function physicsRBDApplyTorqueImpulse(object: Object3D, impulse: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.applyTorqueImpulse(impulse, true);
}
// add
export function physicsRBDAddForce(object: Object3D, force: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.addForce(force, true);
}
export function physicsRBDAddForceAtPoint(object: Object3D, force: Vector3, point: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.addForceAtPoint(force, point, true);
}
export function physicsRBDAddTorque(object: Object3D, torque: Vector3) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.addTorque(torque, true);
}
// reset
export function physicsRBDResetForces(object: Object3D, wakeup: boolean) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.resetForces(wakeup);
}
export function physicsRBDResetTorques(object: Object3D, wakeup: boolean) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.resetTorques(wakeup);
}

export function setPhysicsRBDKinematicPosition(object: Object3D, targetPosition: Vector3, lerp: number) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	if (!body.isKinematic()) {
		console.warn('rbd is not kinematic');
		return;
	}
	if (lerp < 1) {
		const rbdPosition = body.translation();
		currentPos.set(rbdPosition.x, rbdPosition.y, rbdPosition.z);
		newPos.copy(targetPosition);
		currentPos.lerp(newPos, lerp);
		body.setNextKinematicTranslation(currentPos);
	} else {
		body.setNextKinematicTranslation(targetPosition);
	}
}
export function setPhysicsRBDKinematicRotation(object: Object3D, targetQuaternion: Quaternion, lerp: number) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	if (!body.isKinematic()) {
		console.warn('rbd is not kinematic');
		return;
	}
	if (lerp < 1) {
		const rbdRotation = body.rotation();
		currentQuaternion.set(rbdRotation.x, rbdRotation.y, rbdRotation.z, rbdRotation.w);
		newQuaternion.copy(currentQuaternion);
		currentQuaternion.slerp(newQuaternion, lerp);
		body.setNextKinematicRotation(currentQuaternion);
	} else {
		body.setNextKinematicRotation(targetQuaternion);
	}
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
	}
	TypeAssert.unreachable(colliderType);
}
