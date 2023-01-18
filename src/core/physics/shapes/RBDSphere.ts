import type {Collider, Ball} from '@dimforge/rapier3d';
import {Object3D} from 'three';
import {
	CorePhysicsAttribute,
	PhysicsRBDColliderType,
	physicsAttribNameLive,
	PhysicsRBDSphereAttribute,
} from '../PhysicsAttribute';
import {_getRBD} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';
import {CoreObject} from '../../geometry/Object';

export function createPhysicsSphere(PhysicsLib: PhysicsLib, object: Object3D) {
	const radius = CorePhysicsAttribute.getRadius(object);
	return PhysicsLib.ColliderDesc.ball(radius);
}

const attributeRadiusLive = physicsAttribNameLive(PhysicsRBDSphereAttribute.RADIUS);
export function currentRadius(object: Object3D, collider: Collider) {
	// get prev value
	let _currentRadius: number | undefined = CoreObject.attribValue(object, attributeRadiusLive) as number | undefined;
	if (_currentRadius == null) {
		const shape = collider.shape as Ball;
		_currentRadius = shape.radius;
		CoreObject.setAttribute(object, attributeRadiusLive, _currentRadius);
	}
	return _currentRadius;
}

export function getPhysicsRBDSphereRadius(object: Object3D): number | undefined {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (colliderType == null || colliderType != PhysicsRBDColliderType.SPHERE) {
		return;
	}
	const collider = body.collider(0);
	if (!collider) {
		return;
	}
	return currentRadius(object, collider);
}

export function setPhysicsRBDSphereProperty(
	object: Object3D,
	targetRadius: number,
	lerp: number,
	updateObjectMatrix: boolean
) {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (colliderType == null || colliderType != PhysicsRBDColliderType.SPHERE) {
		return;
	}
	const collidersCount = body.numColliders();
	const originalRadiusAttrib = CorePhysicsAttribute.getRadius(object);

	for (let i = 0; i < collidersCount; i++) {
		const collider = body.collider(i);
		if (!collider) {
			return;
		}
		if (lerp < 1) {
			targetRadius = lerp * targetRadius + (1 - lerp) * currentRadius(object, collider);
		}
		// update radius on shape and object
		collider.setRadius(targetRadius);
		CoreObject.setAttribute(object, attributeRadiusLive, targetRadius);
		// update scale
		const newScale = targetRadius / originalRadiusAttrib;
		object.scale.set(newScale, newScale, newScale);
		if (updateObjectMatrix) {
			object.updateMatrix();
		}
	}
}
