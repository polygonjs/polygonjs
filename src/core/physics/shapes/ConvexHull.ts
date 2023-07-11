import {BufferAttribute, Mesh, Object3D} from 'three';
import {PhysicsLib} from '../CorePhysics';

export function createPhysicsConvexHull(PhysicsLib: PhysicsLib, object: Object3D) {
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return;
	}
	const nonIndexedGeometry = geometry.toNonIndexed();
	const position = nonIndexedGeometry.getAttribute('position') as BufferAttribute;
	if (!position) {
		return;
	}
	const float32Array = new Float32Array(position.array);
	return PhysicsLib.ColliderDesc.convexHull(float32Array);
}
