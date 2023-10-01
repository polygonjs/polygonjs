import type {Collider, Ball} from '@dimforge/rapier3d-compat';
import {Object3D} from 'three';
import {
	CorePhysicsAttribute,
	PhysicsRBDColliderType,
	physicsAttribNameLive,
	PhysicsRBDRadiusAttribute,
} from '../PhysicsAttribute';
import {_getRBDFromObject} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';
import {getPhysicsRBDRadius, RBDCommonProperty} from './_CommonHeightRadius';
import {touchRBDProperty} from '../../reactivity/RBDPropertyReactivity';
import {coreObjectClassFactory} from '../../geometry/CoreObjectFactory';

const EXPECTED_TYPE = PhysicsRBDColliderType.SPHERE;

export function createPhysicsSphere(PhysicsLib: PhysicsLib, object: Object3D) {
	const radius = CorePhysicsAttribute.getRadius(object) * object.scale.y;
	return PhysicsLib.ColliderDesc.ball(radius);
}

const attributeRadiusLive = physicsAttribNameLive(PhysicsRBDRadiusAttribute.RADIUS);
export function currentRadius(object: Object3D, collider: Collider) {
	const coreObjectClass = coreObjectClassFactory(object);
	let _currentRadius: number | undefined = coreObjectClass.attribValue(object, attributeRadiusLive) as
		| number
		| undefined;
	if (_currentRadius == null) {
		const shape = collider.shape as Ball;
		_currentRadius = shape.radius;
		coreObjectClass.setAttribute(object, attributeRadiusLive, _currentRadius);
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
		const coreObjectClass = coreObjectClassFactory(object);
		coreObjectClass.setAttribute(object, attributeRadiusLive, targetRadius);
		touchRBDProperty(object, RBDCommonProperty.RADIUS);
		// update scale
		const newScale = targetRadius / originalRadiusAttrib;
		object.scale.set(newScale, newScale, newScale);
		if (updateObjectMatrix) {
			object.updateMatrix();
		}
	}
}
