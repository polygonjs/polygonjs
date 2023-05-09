import {Object3D} from 'three';
import {CorePhysicsAttribute, PhysicsRBDColliderType} from '../PhysicsAttribute';
import {_getRBD} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';
import {getPhysicsRBDHeight, getPhysicsRBDRadius, setPhysicsRBDHeightRadiusProperty} from './_CommonHeightRadius';

const EXPECTED_TYPE = PhysicsRBDColliderType.CONE;

export function createPhysicsCone(PhysicsLib: PhysicsLib, object: Object3D) {
	const halfHeight = CorePhysicsAttribute.getHeight(object) * 0.5 * object.scale.y;
	const radius = CorePhysicsAttribute.getRadius(object) * object.scale.x;

	const borderRadius = CorePhysicsAttribute.getBorderRadius(object);
	if (borderRadius <= 0) {
		return PhysicsLib.ColliderDesc.cone(halfHeight, radius);
	} else {
		const borderRadius2 = Math.min(borderRadius, Math.min(halfHeight, radius));
		const halfHeight2 = halfHeight - borderRadius2;
		const radius2 = radius - borderRadius2;
		return PhysicsLib.ColliderDesc.roundCone(halfHeight2, radius2, borderRadius2);
	}
}

export function _getPhysicsRBDConeHeight(object: Object3D): number | undefined {
	return getPhysicsRBDHeight(EXPECTED_TYPE, object);
}
export function _getPhysicsRBDConeRadius(object: Object3D): number | undefined {
	return getPhysicsRBDRadius(EXPECTED_TYPE, object);
}

export function _setPhysicsRBDConeProperty(
	object: Object3D,
	targetRadius: number,
	targetHeight: number,
	lerp: number,
	updateObjectMatrix: boolean
) {
	setPhysicsRBDHeightRadiusProperty(EXPECTED_TYPE, object, targetRadius, targetHeight, lerp, updateObjectMatrix);
}
