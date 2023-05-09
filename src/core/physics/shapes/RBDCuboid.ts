import type {Collider, Cuboid} from '@dimforge/rapier3d-compat';
import {Object3D, Vector3} from 'three';
import {
	CorePhysicsAttribute,
	PhysicsRBDColliderType,
	physicsAttribNameLive,
	PhysicsRBDCuboidAttribute,
} from '../PhysicsAttribute';
import {_getRBD} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';
import {CoreObject} from '../../geometry/Object';
import {touchRBDProperty} from '../../reactivity/RBDPropertyReactivity';

const EXPECTED_TYPE = PhysicsRBDColliderType.CUBOID;

export enum RBDCuboidProperty {
	SIZES = 'sizes',
}

const tmp = new Vector3();
let _currentSizes = new Vector3();
let _targetSizes = new Vector3();
let _targetHalfSizes = new Vector3();
let _originalSizes = new Vector3();

const attribSizeLiveByObject: WeakMap<Object3D, Vector3> = new WeakMap();
function _getAttribSizeLiveByObject(object3D: Object3D) {
	let v = attribSizeLiveByObject.get(object3D);
	if (!v) {
		v = new Vector3();
		attribSizeLiveByObject.set(object3D, v);
	}
	return v;
}

export function createPhysicsCuboid(PhysicsLib: PhysicsLib, object: Object3D) {
	CorePhysicsAttribute.getCuboidSizes(object, tmp);
	const size = CorePhysicsAttribute.getCuboidSize(object);
	tmp.multiplyScalar(size * 0.5);
	tmp.multiply(object.scale);
	const borderRadius = CorePhysicsAttribute.getBorderRadius(object);
	if (borderRadius <= 0) {
		return PhysicsLib.ColliderDesc.cuboid(tmp.x, tmp.y, tmp.z);
	} else {
		// We seem to need a tiny offset.
		// If it was 0, the RBD would not fall
		const safetyOffset = 0.02;
		const minDim = Math.min(tmp.x, tmp.y, tmp.z) + safetyOffset;
		const borderRadius2 = Math.min(borderRadius, minDim);
		tmp.subScalar(borderRadius2);
		return PhysicsLib.ColliderDesc.roundCuboid(tmp.x, tmp.y, tmp.z, borderRadius2);
	}
}

const attributeSizesLive = physicsAttribNameLive(PhysicsRBDCuboidAttribute.SIZES);
export function currentSizes(object: Object3D, collider: Collider, target: Vector3): void {
	let result: Vector3 | undefined = CoreObject.attribValue(object, attributeSizesLive, 0, target) as
		| Vector3
		| undefined;
	if (result == null) {
		const shape = collider.shape as Cuboid;
		const v = shape.halfExtents;
		target.set(v.x, v.y, v.z).multiplyScalar(2);
		CoreObject.setAttribute(object, attributeSizesLive, new Vector3().copy(target));
	}
}

export function _getPhysicsRBDCuboidSizes(object: Object3D, target: Vector3): void {
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
	currentSizes(object, collider, target);
}

export function _setPhysicsRBDCuboidProperty(
	object: Object3D,
	targetSizes: Vector3,
	targetSize: number,
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
	CorePhysicsAttribute.getCuboidSizes(object, _originalSizes);
	const originalSize = CorePhysicsAttribute.getCuboidSize(object);
	_originalSizes.multiplyScalar(originalSize);

	for (let i = 0; i < collidersCount; i++) {
		const collider = body.collider(i);
		if (!collider) {
			return;
		}
		_targetSizes.copy(targetSizes).multiplyScalar(targetSize);
		if (lerp < 1) {
			currentSizes(object, collider, _currentSizes);
			_targetSizes.lerp(_currentSizes, 1 - lerp);
		}
		// update radius on shape and object
		const v = _getAttribSizeLiveByObject(object);
		v.copy(_targetSizes);
		CoreObject.setAttribute(object, attributeSizesLive, v);
		touchRBDProperty(object, RBDCuboidProperty.SIZES);
		// update scale
		object.scale.copy(_targetSizes).divide(_originalSizes);
		if (updateObjectMatrix) {
			object.updateMatrix();
		}
		// update rbd in the end, so that we scale size *.5 last
		_targetHalfSizes.copy(_targetSizes).multiplyScalar(0.5);
		collider.setHalfExtents(_targetHalfSizes);
	}
}
