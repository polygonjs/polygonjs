import {TypeAssert} from './../../engine/poly/Assert';
// import {CorePhysicsUserData} from './PhysicsUserData';
import {PhysicsRBDColliderType, PhysicsRBDType, CorePhysicsAttribute, PhysicsIdAttribute} from './PhysicsAttribute';
import {BufferAttribute, Mesh, Object3D, Vector3, Quaternion} from 'three';
import type {World, RigidBodyType, RigidBodyDesc, RigidBody} from '@dimforge/rapier3d';
import {CorePhysicsLoaded, PhysicsLib} from './CorePhysics';
import {CoreObject} from '../geometry/Object';

let rbdId = 1;
const physicsRBDByRBDId: Map<number, RigidBody> = new Map();

function _createRBD(world: World, rigidBodyDesc: RigidBodyDesc, object: Object3D) {
	const rigidBody = world.createRigidBody(rigidBodyDesc);
	physicsRBDByRBDId.set(rbdId, rigidBody);
	CoreObject.addAttribute(object, PhysicsIdAttribute.RBD, rbdId);
	rbdId++;
	return rigidBody;
}
function _getRBD(object: Object3D) {
	const rbdId = CoreObject.attribValue(object, PhysicsIdAttribute.RBD) as number | undefined;
	if (rbdId == null) {
		return;
	}
	return physicsRBDByRBDId.get(rbdId);
}

export function physicsCreateRBD(PhysicsLib: PhysicsLib, world: World, object: Object3D) {
	const type = CorePhysicsAttribute.getRBDType(object);
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (!(type != null && colliderType != null)) {
		return;
	}
	const rbdType: RigidBodyType | undefined = PhysicsRBDTypeToRigidBodyType(type);
	if (rbdType == null) {
		return;
	}

	// restoreRBDInitMatrix(object);

	const id = CorePhysicsAttribute.getRBDId(object);
	const rigidBodyDesc = new PhysicsLib.RigidBodyDesc(rbdType);

	rigidBodyDesc.setTranslation(object.position.x, object.position.y, object.position.z);
	rigidBodyDesc.setRotation(object.quaternion);
	const rigidBody = _createRBD(world, rigidBodyDesc, object);

	const density = CorePhysicsAttribute.getDensity(object);
	const linearDamping = CorePhysicsAttribute.getLinearDamping(object);
	const angularDamping = CorePhysicsAttribute.getAngularDamping(object);
	const friction = CorePhysicsAttribute.getFriction(object);
	const canSleep = CorePhysicsAttribute.getCanSleep(object);

	if (linearDamping != null) {
		rigidBodyDesc.setLinearDamping(linearDamping);
	}
	if (angularDamping != null) {
		rigidBodyDesc.setAngularDamping(angularDamping);
	}
	if (canSleep != null) {
		rigidBodyDesc.setCanSleep(canSleep);
	}
	const colliderDesc = PhysicsRBDCollider(PhysicsLib, colliderType, object);
	if (!colliderDesc) {
		console.error('no collider', object);
		return;
	}
	const restitution = CorePhysicsAttribute.getRestitution(object);
	if (restitution != null) {
		colliderDesc.setRestitution(restitution);
	}
	if (friction != null) {
		colliderDesc.setFriction(friction);
	}
	if (density != null) {
		colliderDesc.setDensity(density);
	}

	world.createCollider(colliderDesc, rigidBody);

	return {colliderDesc, rigidBody, id};
}

// const PHYSICS_INIT_MATRIX_ATTRIB_NAME = '__physicsInitMatrix__';
// interface Object3DWithInitMatrix extends Object3D {
// 	__physicsInitMatrix__?: Matrix4;
// }
// function physicsRBDSetInitMatrix(object: Object3D) {
// 	if (PHYSICS_INIT_MATRIX_ATTRIB_NAME in object) {
// 		return;
// 	}
// 	object.updateWorldMatrix(true, false);
// 	object.updateMatrix();
// 	(object as Object3DWithInitMatrix)[PHYSICS_INIT_MATRIX_ATTRIB_NAME] = object.matrix.clone();
// 	console.warn('set', object.matrix.elements);
// }
// function restoreRBDInitMatrix(object: Object3D) {
// 	if (!(PHYSICS_INIT_MATRIX_ATTRIB_NAME in object)) {
// 		return;
// 	}
// 	const initMatrix = (object as Object3DWithInitMatrix)[PHYSICS_INIT_MATRIX_ATTRIB_NAME];
// 	if (!(initMatrix instanceof Matrix4)) {
// 		return;
// 	}
// 	object.matrix.copy(initMatrix);
// 	console.warn('restored', initMatrix.elements);
// 	delete (object as Object3DWithInitMatrix)[PHYSICS_INIT_MATRIX_ATTRIB_NAME];
// }

// private _updateRBDBound = this._updateRBD.bind(this);
export async function physicsUpdateRBD(object: Object3D) {
	const body = await _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	// physicsRBDSetInitMatrix(object);
	const position = body.translation();
	const rotation = body.rotation();
	object.position.set(position.x, position.y, position.z);
	object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
	object.updateMatrix();
}
const currentPos = new Vector3();
const newPos = new Vector3();
const currentQuaternion = new Quaternion();
const newQuaternion = new Quaternion();

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
const tmp = new Vector3();
function PhysicsRBDCollider(PhysicsLib: PhysicsLib, colliderType: PhysicsRBDColliderType, object: Object3D) {
	switch (colliderType) {
		case PhysicsRBDColliderType.CAPSULE: {
			const halfHeight = CorePhysicsAttribute.getHeight(object) * 0.5;
			const radius = CorePhysicsAttribute.getRadius(object);
			return PhysicsLib.ColliderDesc.capsule(halfHeight, radius);
		}
		case PhysicsRBDColliderType.CUBOID: {
			CorePhysicsAttribute.getCuboidSizes(object, tmp);
			const size = CorePhysicsAttribute.getCuboidSize(object);
			tmp.multiplyScalar(size * 0.5);
			return PhysicsLib.ColliderDesc.cuboid(tmp.x, tmp.y, tmp.z);
		}
		case PhysicsRBDColliderType.CONE: {
			const halfHeight = CorePhysicsAttribute.getHeight(object) * 0.5;
			const radius = CorePhysicsAttribute.getRadius(object);
			return PhysicsLib.ColliderDesc.cone(halfHeight, radius);
		}
		case PhysicsRBDColliderType.CONVEX_HULL: {
			const geometry = (object as Mesh).geometry;
			if (!geometry) {
				return;
			}
			const nonIndexedGeometry = geometry.toNonIndexed();
			const position = nonIndexedGeometry.getAttribute('position') as BufferAttribute;
			if (!position) {
				return;
			}
			const float32Array = new Float32Array(position.array);
			return PhysicsLib.ColliderDesc.convexHull(float32Array);
		}
		case PhysicsRBDColliderType.TRIMESH: {
			const geometry = (object as Mesh).geometry;
			if (!geometry) {
				return;
			}
			const position = geometry.getAttribute('position') as BufferAttribute;
			const index = geometry.getIndex();
			if (!(position && index)) {
				return;
			}
			const float32ArrayPosition = new Float32Array(position.array);
			const uint32ArrayIndex = new Uint32Array(index.array);
			return PhysicsLib.ColliderDesc.trimesh(float32ArrayPosition, uint32ArrayIndex);
		}
		case PhysicsRBDColliderType.CYLINDER: {
			const halfHeight = CorePhysicsAttribute.getHeight(object) * 0.5;
			const radius = CorePhysicsAttribute.getRadius(object);
			return PhysicsLib.ColliderDesc.cylinder(halfHeight, radius);
		}
		case PhysicsRBDColliderType.SPHERE: {
			const radius = CorePhysicsAttribute.getRadius(object);
			return PhysicsLib.ColliderDesc.ball(radius);
		}
	}
	TypeAssert.unreachable(colliderType);
}
