import type {Collider, Capsule} from '@dimforge/rapier3d-compat';
import {Object3D} from 'three';
import {
	CorePhysicsAttribute,
	PhysicsRBDColliderType,
	physicsAttribNameLive,
	PhysicsRBDHeightAttribute,
	PhysicsRBDRadiusAttribute,
} from '../PhysicsAttribute';
import {_getRBDFromObject} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';
import {CoreObject} from '../../geometry/Object';
import {touchRBDProperty} from '../../reactivity/RBDPropertyReactivity';

export enum RBDCapsuleProperty {
	RADIUS = 'radius',
	HEIGHT = 'height',
}

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
		CoreObject.setAttribute(object, attributeHeightLive, _currentHeight);
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

export function _getPhysicsRBDCapsuleHeight(object: Object3D): number | undefined {
	const body = _getRBDFromObject(object);
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
export function _getPhysicsRBDCapsuleRadius(object: Object3D): number | undefined {
	const body = _getRBDFromObject(object);
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

export function _setPhysicsRBDCapsuleProperty(
	object: Object3D,
	targetScale: number,
	lerp: number,
	updateObjectMatrix: boolean
) {
	const body = _getRBDFromObject(object);
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
		// let targetHeight = targetScale;
		let targetRadius = targetScale;

		if (lerp < 1) {
			// targetHeight = lerp * targetHeight + (1 - lerp) * currentHeight(object, collider);
			targetRadius = lerp * targetRadius + (1 - lerp) * currentRadius(object, collider);
		}
		const radiusRatio = targetRadius / originalRadiusAttrib;
		const targetHeight = 0.5 * radiusRatio * originalHeightAttrib;
		// update radius on shape and object
		collider.setHalfHeight(targetHeight);
		collider.setRadius(targetRadius);
		CoreObject.setAttribute(object, attributeHeightLive, targetHeight);
		CoreObject.setAttribute(object, attributeRadiusLive, targetRadius);
		touchRBDProperty(object, RBDCapsuleProperty.HEIGHT);
		touchRBDProperty(object, RBDCapsuleProperty.RADIUS);
		// update scale
		// TODO: we can't apply a simple scale to a capsule
		// it could possibly work if the capsule was 3 objects (1 tube + 2 half spheres)

		// const heightRatio = targetHeight / originalHeightAttrib; // should be on y
		object.scale.set(radiusRatio, radiusRatio, radiusRatio);
		if (updateObjectMatrix) {
			object.updateMatrix();
		}
	}
}
