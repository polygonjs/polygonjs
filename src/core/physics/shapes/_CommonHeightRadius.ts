import type {Collider, Cone} from '@dimforge/rapier3d-compat';
import {Object3D} from 'three';
import {
	CorePhysicsAttribute,
	PhysicsRBDColliderType,
	physicsAttribNameLive,
	PhysicsRBDRadiusAttribute,
	PhysicsRBDHeightAttribute,
} from '../PhysicsAttribute';
import {_getRBDFromObject} from '../PhysicsRBD';
import {touchRBDProperty} from '../../reactivity/RBDPropertyReactivity';
import {coreObjectClassFactory} from '../../geometry/CoreObjectFactory';

export enum RBDCommonProperty {
	RADIUS = 'radius',
	HEIGHT = 'height',
}

const attributeHeightLive = physicsAttribNameLive(PhysicsRBDHeightAttribute.HEIGHT);
const attributeRadiusLive = physicsAttribNameLive(PhysicsRBDRadiusAttribute.RADIUS);
export function currentHeight(object: Object3D, collider: Collider) {
	const coreObjectClass = coreObjectClassFactory(object);
	let _currentHeight: number | undefined = coreObjectClass.attribValue(object, attributeHeightLive) as
		| number
		| undefined;
	if (_currentHeight == null) {
		const shape = collider.shape as Cone;
		_currentHeight = shape.halfHeight * 2;
		coreObjectClass.setAttribute(object, attributeHeightLive, _currentHeight);
	}
	return _currentHeight;
}
export function currentRadius(object: Object3D, collider: Collider) {
	const coreObjectClass = coreObjectClassFactory(object);
	let _currentRadius: number | undefined = coreObjectClass.attribValue(object, attributeRadiusLive) as
		| number
		| undefined;
	if (_currentRadius == null) {
		const shape = collider.shape as Cone;
		_currentRadius = shape.radius;
		coreObjectClass.setAttribute(object, attributeRadiusLive, _currentRadius);
	}
	return _currentRadius;
}

export function getPhysicsRBDHeight(
	expectedType: PhysicsRBDColliderType.CONE | PhysicsRBDColliderType.CYLINDER,
	object: Object3D
): number | undefined {
	const body = _getRBDFromObject(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (colliderType == null || colliderType != expectedType) {
		return;
	}
	const collider = body.collider(0);
	if (!collider) {
		return;
	}
	return currentHeight(object, collider);
}
export function getPhysicsRBDRadius(
	expectedType: PhysicsRBDColliderType.CONE | PhysicsRBDColliderType.CYLINDER | PhysicsRBDColliderType.SPHERE,
	object: Object3D
): number | undefined {
	const body = _getRBDFromObject(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (colliderType == null) {
		console.warn('no colliderType found');
		return;
	}
	if (colliderType != expectedType) {
		console.warn(`colliderType '${colliderType}' not the expected one ('${expectedType}')`);
		return;
	}
	const collider = body.collider(0);
	if (!collider) {
		console.warn('no collider found');
		return;
	}
	return currentRadius(object, collider);
}

export function setPhysicsRBDHeightRadiusProperty(
	expectedType: PhysicsRBDColliderType.CONE | PhysicsRBDColliderType.CYLINDER,
	object: Object3D,
	targetRadius: number,
	targetHeight: number,
	lerp: number,
	updateObjectMatrix: boolean
) {
	const body = _getRBDFromObject(object);
	if (!body) {
		console.warn('no rbd found');
		return;
	}
	const colliderType = CorePhysicsAttribute.getColliderType(object);
	if (colliderType == null || colliderType != expectedType) {
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
		const coreObjectClass = coreObjectClassFactory(object);
		coreObjectClass.setAttribute(object, attributeHeightLive, targetHeight);
		coreObjectClass.setAttribute(object, attributeRadiusLive, targetRadius);
		touchRBDProperty(object, RBDCommonProperty.HEIGHT);
		touchRBDProperty(object, RBDCommonProperty.RADIUS);
		// update scale
		const scaleXZ = targetRadius / originalRadiusAttrib;
		object.scale.set(scaleXZ, targetHeight / originalHeightAttrib, scaleXZ);
		if (updateObjectMatrix) {
			object.updateMatrix();
		}
	}
}
