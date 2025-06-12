import {Vector3, BufferGeometry} from 'three';
import {TriangleBasicGraph} from './TriangleBasicGraph';
import {Number3} from '../../../../../../types/GlobalTypes';

const _v3 = new Vector3();

const _triangleIndices: Number3 = [0, 0, 0];

export function triangleBasicGraphFromGeometry(geometry: BufferGeometry): TriangleBasicGraph | undefined {
	const index = geometry.getIndex();
	if (!index) {
		return;
	}
	const trianglesCount = index.array.length / 3;
	const graph = new TriangleBasicGraph();
	for (let i = 0; i < trianglesCount; i++) {
		_v3.fromArray(index.array, i * 3);
		_v3.toArray(_triangleIndices);
		graph.setTriangle(i, _triangleIndices);
		// debug display
		// if (i % 100_000 == 0) {
		// 	console.log(i);
		// }
	}
	return graph;
}
