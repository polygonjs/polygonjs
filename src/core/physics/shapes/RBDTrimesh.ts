import {BufferAttribute, Mesh, Object3D} from 'three';
import {_getRBD} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';

export function createPhysicsTriMesh(PhysicsLib: PhysicsLib, object: Object3D) {
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return;
	}
	const position = geometry.getAttribute('position') as BufferAttribute;
	if (!position) {
		return;
	}
	let indexArray = geometry.getIndex()?.array as number[];
	if (!indexArray) {
		const pointsCount = position.array.length / 3;
		indexArray = new Array(pointsCount);
		for (let i = 0; i < pointsCount; i++) {
			indexArray[i] = i;
		}
	}
	const float32ArrayPosition = new Float32Array(position.array);
	const uint32ArrayIndex = new Uint32Array(indexArray);
	return PhysicsLib.ColliderDesc.trimesh(float32ArrayPosition, uint32ArrayIndex);
}
