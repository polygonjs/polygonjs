import {Object3D} from 'three';
import {CorePhysicsAttribute, PhysicsRBDColliderType} from '../PhysicsAttribute';
import {_getRBD} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';
import {getPhysicsRBDHeight, getPhysicsRBDRadius, setPhysicsRBDHeightRadiusProperty} from './_CommonHeightRadius';

const EXPECTED_TYPE = PhysicsRBDColliderType.CYLINDER;

export function createPhysicsCylinder(PhysicsLib: PhysicsLib, object: Object3D) {
	const halfHeight = CorePhysicsAttribute.getHeight(object) * 0.5;
	const radius = CorePhysicsAttribute.getRadius(object);
	return PhysicsLib.ColliderDesc.cylinder(halfHeight, radius);
}

export function getPhysicsRBDCylinderHeight(object: Object3D): number | undefined {
	return getPhysicsRBDHeight(EXPECTED_TYPE, object);
}
export function getPhysicsRBDCylinderRadius(object: Object3D): number | undefined {
	return getPhysicsRBDRadius(EXPECTED_TYPE, object);
}

export function setPhysicsRBDCylinderProperty(
	object: Object3D,
	targetRadius: number,
	targetHeight: number,
	lerp: number,
	updateObjectMatrix: boolean
) {
	setPhysicsRBDHeightRadiusProperty(EXPECTED_TYPE, object, targetRadius, targetHeight, lerp, updateObjectMatrix);
}
