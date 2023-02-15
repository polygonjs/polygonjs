import type {Collider, Capsule} from '@dimforge/rapier3d-compat';
import {Object3D} from 'three';
import {
	CorePhysicsAttribute,
	PhysicsRBDColliderType,
	physicsAttribNameLive,
	PhysicsRBDHeightAttribute,
	PhysicsRBDRadiusAttribute,
} from '../PhysicsAttribute';
import {_getRBD} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';
import {CoreObject} from '../../geometry/Object';

const EXPECTED_TYPE = PhysicsRBDColliderType.CAPSULE;

export function createPhysicsCapsule(PhysicsLib: PhysicsLib, object: Object3D) {
	const halfHeight = CorePhysicsAttribute.getHeight(object) * 0.5 * object.scale.y;
	const radius = CorePhysicsAttribute.getRadius(object) * object.scale.x;
	return PhysicsLib.ColliderDesc.capsule(halfHeight, radius);
}

const attributeHeightLive = physicsAttribNameLive(PhysicsRBDHeightAttribute.HEIGHT);
const attributeRadiusLive = physicsAttribNameLive(PhysicsRBDRadiusAttribute.RADIUS);
export function currentHeight(object: Object3D, collider: Collider) {
	let _currentHeight: number | undefined = CoreObject.attribValue(object, attributeHeightLive) as number | undefined;
	if (_currentHeight == null) {
		const shape = collider.shape as Capsule;
		_currentHeight = shape.halfHeight * 2;
		CoreObject.setAttribute(object, attributeRadiusLive, _currentHeight);
	}
	return _currentHeight;
}
export function currentRadius(object: Object3D, collider: Collider) {
	let _currentRadius: number | undefined = CoreObject.attribValue(object, attributeRadiusLive) as number | undefined;
	if (_currentRadius == null) {
		const shape = collider.shape as Capsule;
		_currentRadius = shape.radius;
		CoreObject.setAttribute(object, attributeRadiusLive, _currentRadius);
	}
	return _currentRadius;
}

export function getPhysicsRBDCapsuleHeight(object: Object3D): number | undefined {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (colliderType == null || colliderType != EXPECTED_TYPE) {
		return;
	}
	const collider = body.collider(0);
	if (!collider) {
		return;
	}
	return currentHeight(object, collider);
}
export function getPhysicsRBDCapsuleRadius(object: Object3D): number | undefined {
	const body = _getRBD(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (colliderType == null || colliderType != EXPECTED_TYPE) {
		return;
	}
	const collider = body.collider(0);
	if (!collider) {
		return;
	}
	return currentRadius(object, collider);
}

export function setPhysicsRBDCapsuleProperty(
	object: Object3D,
	targetHeight: number,
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
	if (colliderType == null || colliderType != EXPECTED_TYPE) {
		return;
	}
	const collidersCount = body.numColliders();
	const originalHeightAttrib = CorePhysicsAttribute.getHeight(object);
	const originalRadiusAttrib = CorePhysicsAttribute.getRadius(object);

	for (let i = 0; i < collidersCount; i++) {
		const collider = body.collider(i);
		if (!collider) {
			return;
		}
		if (lerp < 1) {
			targetHeight = lerp * targetHeight + (1 - lerp) * currentHeight(object, collider);
			targetRadius = lerp * targetRadius + (1 - lerp) * currentRadius(object, collider);
		}
		// update radius on shape and object
		collider.setHalfHeight(targetHeight * 0.5);
		collider.setRadius(targetRadius);
		CoreObject.setAttribute(object, attributeHeightLive, targetHeight);
		CoreObject.setAttribute(object, attributeRadiusLive, targetRadius);
		// update scale
		// TODO: we can't apply a simple scale to a capsule
		// it could possibly work if the capsule was 3 objects (1 tube + 2 half spheres)
		object.scale.set(
			targetRadius / originalRadiusAttrib,
			targetRadius / originalRadiusAttrib,
			targetHeight / originalHeightAttrib
		);
		if (updateObjectMatrix) {
			object.updateMatrix();
		}
	}
}
