import {BufferAttribute, BufferGeometry, Vector3} from 'three';
import {SetUtils} from '../../SetUtils';
import {Number2} from '../../../types/GlobalTypes';

interface Face {
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

export function adjacencyVertices(geometry: BufferGeometry, vertices: Vector3[]) {
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

export function adjacencyGroupFaces(geometry: BufferGeometry, vertices: Vector3[]) {
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
function getFace(arr: Face[], first: number, next: number) {
	for (let r = 0; r < arr.length; r++) {
		var n = arr[r];

		if ((n.a === first && n.b === next) || (n.b === first && n.c === next) || (n.c === first && n.a === next))
			return n;
	}

	throw new Error("populateAdjacency: shouldn't reach here.");
}

export function populateAdjacency(faces: Face[][], vertices: Vector3[]) {
	const adjacency: number[][] = Array.from({length: vertices.length}, () => new Array());

	// compute sorted adjacency list for every vertex
	for (let r = 0; r < faces.length; r++) {
		let n = faces[r][0];

		// cycle in a fan, through all faces of the vertex
		let i = 0;
		while (true) {
			if (n.a == r) {
				adjacency[r].push(n.c);
				n = getFace(faces[r], r, n.c); // face with reverse winding order ( a ) -> ( c )
			} else if (n.b == r) {
				adjacency[r].push(n.a);
				n = getFace(faces[r], r, n.a); // face with reverse winding order ( b ) -> ( a )
			} else {
				// n.c == r

				adjacency[r].push(n.b);
				n = getFace(faces[r], r, n.b); // face with reverse winding order ( c ) -> ( b )
			}

			// back to the start - end
			if (n == faces[r][0]) break;

			i++;
			if (i == 8) {
				break;
			}
		}
	}
	return adjacency;

	// console.log({adjacency});
	// console.log(ArrayUtils.uniq(adjacency.map((a) => a.length)));
	// const countByLength: Map<number, number> = new Map();
	// for (let elem of adjacency) {
	// 	const count = elem.length;
	// 	const currentCount = countByLength.get(count);
	// 	if (currentCount == null) {
	// 		countByLength.set(count, 1);
	// 	} else {
	// 		countByLength.set(count, currentCount + 1);
	// 	}
	// }
	// countByLength.forEach((count, length) => {
	// 	console.log(`${length} -> ${count}`);
	// });
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
		adjacency[r] = SetUtils.toArray(pointSet);
	}
	return adjacency;
}
