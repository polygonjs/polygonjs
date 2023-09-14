import {BufferAttribute, BufferGeometry, Object3D, Vector3, Mesh} from 'three';
import {setToArray} from '../../SetUtils';
import {Number2} from '../../../types/GlobalTypes';
import {ThreejsObject} from '../modules/three/ThreejsObject';
import {textureFromAttribLookupId, textureFromAttribLookupUv} from './TextureFromAttribute';

export interface Face {
	a: number;
	b: number;
	c: number;
}

const v0 = new Vector3();

export enum AttribAdjacency {
	BASE_NAME = 'adjacency',
	COUNT = 'adjacencyCount',
}

export function adjacencyAttribName(baseAttribName: string, index: number) {
	return `${baseAttribName}${index}`;
}

function _adjacencyVertices(geometry: BufferGeometry, vertices: Vector3[]) {
	const position = geometry.attributes.position;
	if (!(position instanceof BufferAttribute)) {
		console.warn('position is not a BufferAttribute');
		return;
	}

	for (let i = 0, il = position.count; i < il; i++) {
		v0.fromBufferAttribute(position, i);
		vertices.push(v0.clone());
	}
}

function _adjacencyGroupFaces(geometry: BufferGeometry, vertices: Vector3[]) {
	const index = geometry.index;
	if (!index) {
		console.warn('no index');
		return;
	}
	const verticesCount = vertices.length;
	const indexCount = index.count / 3;
	const faces: Face[][] = Array.from({length: verticesCount}, () => new Array());

	// compute all faces for set vertex

	for (let i = 0, il = indexCount; i < il; i++) {
		const i3 = i * 3;
		const a = index.getX(i3 + 0);
		const b = index.getX(i3 + 1);
		const c = index.getX(i3 + 2);

		const face: Face = {a, b, c};

		// console.log(i, a, b, c, indexCount, verticesCount);
		faces[a].push(face);
		faces[b].push(face);
		faces[c].push(face);
	}
	// console.log(indexCount, verticesCount, faces.length);
	// console.log({faces});
	return faces;
}

// support function - find face with winding order ( first ) -> ( next )
// function getFace(arr: Face[], first: number, next: number) {
// 	for (let r = 0; r < arr.length; r++) {
// 		var n = arr[r];

// 		if ((n.a === first && n.b === next) || (n.b === first && n.c === next) || (n.c === first && n.a === next))
// 			return n;
// 	}

// 	throw new Error("populateAdjacency: shouldn't reach here.");
// }

// export function _populateAdjacencyOLD(faces: Face[][], vertices: Vector3[]) {
// 	const adjacency: number[][] = Array.from({length: vertices.length}, () => new Array());

// 	// compute sorted adjacency list for every vertex
// 	for (let r = 0; r < faces.length; r++) {
// 		let n = faces[r][0];

// 		// cycle in a fan, through all faces of the vertex
// 		let i = 0;
// 		while (true) {
// 			if (n.a == r) {
// 				adjacency[r].push(n.c);
// 				n = getFace(faces[r], r, n.c); // face with reverse winding order ( a ) -> ( c )
// 			} else if (n.b == r) {
// 				adjacency[r].push(n.a);
// 				n = getFace(faces[r], r, n.a); // face with reverse winding order ( b ) -> ( a )
// 			} else {
// 				// n.c == r

// 				adjacency[r].push(n.b);
// 				n = getFace(faces[r], r, n.b); // face with reverse winding order ( c ) -> ( b )
// 			}

// 			// back to the start - end
// 			if (n == faces[r][0]) break;

// 			i++;
// 			if (i == 8) {
// 				break;
// 			}
// 		}
// 	}
// 	return adjacency;

// 	// console.log({adjacency});
// 	// console.log(ArrayUtils.uniq(adjacency.map((a) => a.length)));
// 	// const countByLength: Map<number, number> = new Map();
// 	// for (let elem of adjacency) {
// 	// 	const count = elem.length;
// 	// 	const currentCount = countByLength.get(count);
// 	// 	if (currentCount == null) {
// 	// 		countByLength.set(count, 1);
// 	// 	} else {
// 	// 		countByLength.set(count, currentCount + 1);
// 	// 	}
// 	// }
// 	// countByLength.forEach((count, length) => {
// 	// 	console.log(`${length} -> ${count}`);
// 	// });
// }
const _indexPairByFirstIndex: Map<number, Number2> = new Map();
const _endIndices: Set<number> = new Set();
function filterAjacency(indexPairs: Number2[]): Number2[] {
	_indexPairByFirstIndex.clear();
	_endIndices.clear();
	for (const indexPair of indexPairs) {
		_indexPairByFirstIndex.set(indexPair[0], indexPair);
		_endIndices.add(indexPair[1]);
	}
	let startIndex = 0;
	let i = 0;
	for (const indexPair of indexPairs) {
		if (!_endIndices.has(indexPair[0])) {
			startIndex = i;
			break;
		}
		i++;
	}

	const expectedCount = indexPairs.length;
	const rawList: number[] = new Array(expectedCount).fill(-1);
	const result: Number2[] = new Array();

	let currentIndexPair: Number2 | undefined = indexPairs[startIndex];
	for (let i = 0; i < expectedCount; i++) {
		rawList[i] = currentIndexPair[0];
		currentIndexPair = _indexPairByFirstIndex.get(currentIndexPair[1]);
		if (!currentIndexPair) {
			break;
		}
	}
	for (let i = 0; i < expectedCount; i += 2) {
		result.push([rawList[i], rawList[i + 1]]);
	}

	return result;
}

const pointSet: Set<Number2> = new Set();
export function populateAdjacency2(faces: Face[][], vertices: Vector3[]) {
	const adjacency: Number2[][] = Array.from({length: vertices.length}, () => new Array());

	for (let r = 0; r < faces.length; r++) {
		const pointFaces = faces[r];
		if (pointFaces.length == 0) {
			console.warn(`point ${r} has no face`);
		}

		pointSet.clear();

		for (const pointFace of pointFaces) {
			switch (r) {
				case pointFace.a: {
					pointSet.add([pointFace.b, pointFace.c]);
					break;
				}
				case pointFace.b: {
					pointSet.add([pointFace.c, pointFace.a]);
					break;
				}
				case pointFace.c: {
					pointSet.add([pointFace.a, pointFace.b]);
					break;
				}
			}
		}
		adjacency[r] = filterAjacency(setToArray(pointSet));
	}
	return adjacency;
}

interface PopulateAdjacencyOptions {
	adjacencyCountName: string;
	adjacencyBaseName: string;
}
export const POPULATE_ADJACENCY_DEFAULT: PopulateAdjacencyOptions = {
	adjacencyCountName: AttribAdjacency.COUNT,
	adjacencyBaseName: AttribAdjacency.BASE_NAME,
};

export function populateAdjacency3(object: Object3D, params: PopulateAdjacencyOptions) {
	const {adjacencyCountName, adjacencyBaseName} = params;
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return;
	}

	const position = geometry.attributes.position;
	if (!(position instanceof BufferAttribute)) {
		console.warn('position is not a BufferAttribute');
		return;
	}
	const index = geometry.index;
	if (!index) {
		console.warn('no index');
		return;
	}

	// populate vertices
	const vertices: Vector3[] = [];
	_adjacencyVertices(geometry, vertices);

	// group faces

	const faces = _adjacencyGroupFaces(geometry, vertices);
	if (!faces) {
		return;
	}

	// populate adjacency
	const adjacency = populateAdjacency2(faces, vertices);

	// build attributes
	let maxAdjacencyCount = -1;
	for (let arr of adjacency) {
		if (arr.length > maxAdjacencyCount) {
			maxAdjacencyCount = arr.length;
		}
	}
	const attribSize = 2;
	const attributesCount = Math.ceil(maxAdjacencyCount);

	// add object adjacency count
	ThreejsObject.addAttribute(object, adjacencyCountName, maxAdjacencyCount);

	const pointsCount = position.count;

	const _addAdjacencyAttributes = () => {
		for (let attribIndex = 0; attribIndex < attributesCount; attribIndex++) {
			const attribName = adjacencyAttribName(adjacencyBaseName, attribIndex);

			const values = new Array(pointsCount * attribSize).fill(-1);
			for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
				const pointAdjacency = adjacency[pointIndex][attribIndex];
				if (pointAdjacency) {
					for (let i = 0; i < attribSize; i++) {
						const value = pointAdjacency[i];
						values[pointIndex * attribSize + i] = value != null ? value : -1;
					}
				}
			}
			const valuesArray = new Float32Array(values);
			geometry.setAttribute(attribName, new BufferAttribute(valuesArray, attribSize));
		}
	};

	_addAdjacencyAttributes();
	textureFromAttribLookupUv(geometry);
	textureFromAttribLookupId(geometry);
}
export function unpackAdjacency3(object: Object3D, params: PopulateAdjacencyOptions): number[][] {
	const {adjacencyCountName, adjacencyBaseName} = params;
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return [];
	}
	const indices = geometry.index?.array;
	if (!indices) {
		return [];
	}
	const pointsCount = indices.length;
	const adjacencies: number[][] = [];

	const adjacencyCount = ThreejsObject.attribValue(object, adjacencyCountName, 0) as number;
	for (let i = 0; i < pointsCount; i++) {
		const index = indices[i];
		for (let attribIndex = 0; attribIndex < adjacencyCount; attribIndex++) {
			const attribName = adjacencyAttribName(adjacencyBaseName, attribIndex);
			const attribute = geometry.getAttribute(attribName);
			const array = attribute.array as Float32Array;

			let pointAdjacency = adjacencies[index];
			if (!pointAdjacency) {
				pointAdjacency = [];
				adjacencies[index] = pointAdjacency;
			}
			const i0 = array[index * 2];
			const i1 = array[index * 2 + 1];
			if (!pointAdjacency.includes(i0)) {
				pointAdjacency.push(i0);
			}
			if (!pointAdjacency.includes(i1)) {
				pointAdjacency.push(i1);
			}
		}
	}
	return adjacencies;
}
