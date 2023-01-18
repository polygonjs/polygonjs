import {BufferAttribute, Mesh, Object3D} from 'three';
import {_getRBD} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';

export function createPhysicsTriMesh(PhysicsLib: PhysicsLib, object: Object3D) {
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return;
	}
	const position = geometry.getAttribute('position') as BufferAttribute;
	const index = geometry.getIndex();
	if (!(position && index)) {
		return;
	}
	const float32ArrayPosition = new Float32Array(position.array);
	const uint32ArrayIndex = new Uint32Array(index.array);
	return PhysicsLib.ColliderDesc.trimesh(float32ArrayPosition, uint32ArrayIndex);
}
