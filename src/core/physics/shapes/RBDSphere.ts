import type {Collider, Ball} from '@dimforge/rapier3d-compat';
import {Object3D} from 'three';
import {
	CorePhysicsAttribute,
	PhysicsRBDColliderType,
	physicsAttribNameLive,
	PhysicsRBDRadiusAttribute,
} from '../PhysicsAttribute';
import {_getRBD} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';
import {CoreObject} from '../../geometry/Object';
import {getPhysicsRBDRadius, RBDCommonProperty} from './_CommonHeightRadius';
import {touchRBDProperty} from '../../reactivity/RBDPropertyReactivity';

const EXPECTED_TYPE = PhysicsRBDColliderType.SPHERE;

export function createPhysicsSphere(PhysicsLib: PhysicsLib, object: Object3D) {
	const radius = CorePhysicsAttribute.getRadius(object) * object.scale.y;
	return PhysicsLib.ColliderDesc.ball(radius);
}

const attributeRadiusLive = physicsAttribNameLive(PhysicsRBDRadiusAttribute.RADIUS);
export function currentRadius(object: Object3D, collider: Collider) {
	let _currentRadius: number | undefined = CoreObject.attribValue(object, attributeRadiusLive) as number | undefined;
	if (_currentRadius == null) {
		const shape = collider.shape as Ball;
		_currentRadius = shape.radius;
		CoreObject.setAttribute(object, attributeRadiusLive, _currentRadius);
	}
	return _currentRadius;
}

export function _getPhysicsRBDSphereRadius(object: Object3D): number | undefined {
	return getPhysicsRBDRadius(EXPECTED_TYPE, object);
}

export function _setPhysicsRBDSphereProperty(
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
	if (colliderType == null || colliderType != EXPECTED_TYPE) {
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
		touchRBDProperty(object, RBDCommonProperty.RADIUS);
		// update scale
		const newScale = targetRadius / originalRadiusAttrib;
		object.scale.set(newScale, newScale, newScale);
		if (updateObjectMatrix) {
			object.updateMatrix();
		}
	}
}
