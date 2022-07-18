import {TypeAssert} from './../../engine/poly/Assert';
import {CorePhysicsUserData} from './PhysicsUserData';
import {PhysicsRBDColliderType, PhysicsRBDType, CorePhysicsAttribute} from './PhysicsAttribute';
import {Object3D, Vector3} from 'three';
import {World, RigidBodyType} from '@dimforge/rapier3d';
import {PhysicsLib} from './CorePhysics';
export function physicsCreateRBD(PhysicsLib: PhysicsLib, world: World, worldObject: Object3D, object: Object3D) {
	const type = CorePhysicsAttribute.getRBDType(object);
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (!(type != null && colliderType != null)) {
		return;
	}
	const rbdType: RigidBodyType = PhysicsRBDTypeToRigidBodyType(type);
	if (rbdType == null) {
		return;
	}

	const id = CorePhysicsAttribute.getRBDId(object);
	const rigidBodyDesc = new PhysicsLib.RigidBodyDesc(rbdType);

	rigidBodyDesc.setTranslation(object.position.x, object.position.y, object.position.z);
	rigidBodyDesc.setRotation(object.quaternion);
	const rigidBody = world.createRigidBody(rigidBodyDesc);
	CorePhysicsUserData.setRigidBody(object, rigidBody);

	const linearDamping = CorePhysicsAttribute.getLinearDamping(object);
	const angularDamping = CorePhysicsAttribute.getAngularDamping(object);

	if (linearDamping != null) {
		rigidBodyDesc.setLinearDamping(linearDamping);
	}
	if (angularDamping != null) {
		rigidBodyDesc.setAngularDamping(angularDamping);
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

	world.createCollider(colliderDesc, rigidBody);

	console.log('createCollider', {object, colliderDesc, rigidBody, type, colliderType});
	return {colliderDesc, rigidBody, id};
}

// private _updateRBDBound = this._updateRBD.bind(this);
export function physicsUpdateRBD(object: Object3D) {
	const body = CorePhysicsUserData.rigidBody(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const position = body.translation();
	const rotation = body.rotation();
	object.position.set(position.x, position.y, position.z);
	object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
	object.updateMatrix();
}
const currentPos = new Vector3();
const newPos = new Vector3();

export function physicsRBDApplyImpulse(object: Object3D, impulse: Vector3) {
	const body = CorePhysicsUserData.rigidBody(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	body.applyImpulse(impulse, true);
}

export function setPhysicsRBDKinematicPosition(object: Object3D, targetPosition: Vector3, lerp: number) {
	const body = CorePhysicsUserData.rigidBody(object);
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

function PhysicsRBDTypeToRigidBodyType(type: PhysicsRBDType) {
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
		case PhysicsRBDColliderType.CUBOID: {
			CorePhysicsAttribute.getCuboidSize(object, tmp);
			return PhysicsLib.ColliderDesc.cuboid(tmp.x, tmp.y, tmp.z);
		}
		case PhysicsRBDColliderType.SPHERE: {
			const radius = CorePhysicsAttribute.getRadius(object);
			return PhysicsLib.ColliderDesc.ball(radius);
		}
		case PhysicsRBDColliderType.CAPSULE: {
			const halfHeight = CorePhysicsAttribute.getHalfHeight(object);
			const radius = CorePhysicsAttribute.getRadius(object);
			return PhysicsLib.ColliderDesc.capsule(halfHeight, radius);
		}
	}
	TypeAssert.unreachable(colliderType);
}
