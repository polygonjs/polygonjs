import {Object3D, Mesh, LineSegments, BufferGeometry, Vector4, BufferAttribute} from 'three';
import {QuadGeometry} from '../QuadGeometry';
import {QUADTesselationParams} from '../QuadCommon';

const _v4 = new Vector4();
function quadToMesh(quadGeometry: QuadGeometry) {
	const quadsCount = quadGeometry.quadsCount();
	const positions = quadGeometry.attributes.position.array;
	// const normals = quadGeometry.attributes.normal.array;
	// const uvs = quadGeometry.attributes.uv.array;
	const indices = quadGeometry.index;
	const newIndices = new Array(quadsCount * 6);
	const geometry = new BufferGeometry();

	for (let i = 0; i < quadsCount; i++) {
		_v4.fromArray(indices, i * 4);
		newIndices[i * 6 + 0] = _v4.x;
		newIndices[i * 6 + 1] = _v4.y;
		newIndices[i * 6 + 2] = _v4.z;
		newIndices[i * 6 + 3] = _v4.x;
		newIndices[i * 6 + 4] = _v4.z;
		newIndices[i * 6 + 5] = _v4.w;
	}

	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setIndex(newIndices);
	// geometry.setAttribute('normal', new Float32Array(normals), 3);
	// geometry.setAttribute('uv', new Float32Array(uvs), 2);
	return new Mesh(geometry);
}
function quadToLine(quadGeometry: QuadGeometry) {
	const quadsCount = quadGeometry.quadsCount();
	const indices = quadGeometry.index;
	const positions = quadGeometry.attributes.position.array;

	const newIndices = new Array();
	const geometry = new BufferGeometry();
	const edges = new Map<number, number>();

	const addEdge = (a: number, b: number) => {
		if (edges.get(a) == b || edges.get(b) == a) {
			return;
		}
		edges.set(a, b);
		edges.set(b, a);
		newIndices.push(a, b);
	};

	for (let i = 0; i < quadsCount; i++) {
		_v4.fromArray(indices, i * 4);
		addEdge(_v4.x, _v4.y);
		addEdge(_v4.y, _v4.z);
		addEdge(_v4.z, _v4.w);
		addEdge(_v4.w, _v4.x);
	}

	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setIndex(newIndices);
	return new LineSegments(geometry);
}

export function quadToObject3D(quadGeometry: QuadGeometry, options: QUADTesselationParams): Object3D[] | undefined {
	const objects: Object3D[] = [];
	if (options.triangles) {
		objects.push(quadToMesh(quadGeometry));
	}
	if (options.wireframe) {
		objects.push(quadToLine(quadGeometry));
	}
	return objects;
}
