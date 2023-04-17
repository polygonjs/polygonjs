import {Vector3, BufferGeometry, BufferAttribute} from 'three';
import {ArrayUtils} from '../../ArrayUtils';
// import type {ClothController} from '../ClothController';
// import {IcosahedronBufferGeometry} from '../../geometry/operation/Icosahedron';
// import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils';

interface Face {
	a: number;
	b: number;
	c: number;
}

const v0 = new Vector3();

export class ClothGeometryInitController {
	// public readonly geometry: BufferGeometry;
	public readonly vertices: Vector3[] = [];
	public adjacency: number[][] = [];
	// public detail = 31;
	// public mergeTolerance = 0.01;
	public populateAdjacency: boolean = true;
	constructor(public geometry: BufferGeometry) {}
	process() {
		// console.log('process', this.geometry.uuid);
		// this.geometry = this.mainController.clothObject.geometry;
		// console.log('pre merge', this.geometry);
		// this.geometry = new IcosahedronBufferGeometry(0.95, this.detail, false);

		// console.log(this.geometry);
		// if (this.geometry.index) {
		// this.geometry = this.geometry.toNonIndexed();
		// }
		// this.geometry = mergeVertices(this.geometry, this.mergeTolerance);
		// console.log('post merge', this.geometry);

		// this.geometry.scale(0.00095, 0.00095, 0.00095);

		this.populateVertices();
		const faces = this._groupFaces();
		if (!faces) {
			return;
		}
		if (this.populateAdjacency) {
			this._populateAdjacency(faces);
		}
	}

	private populateVertices(): Vector3[] | undefined {
		const position = this.geometry.attributes.position;
		if (!(position instanceof BufferAttribute)) {
			console.warn('position is not a BufferAttribute');
			return;
		}

		const vertices = this.vertices;
		for (let i = 0, il = position.count; i < il; i++) {
			v0.fromBufferAttribute(position, i);
			vertices.push(v0.clone());
		}
	}

	private _groupFaces() {
		const index = this.geometry.index;
		if (!index) {
			console.warn('no index');
			return;
		}
		const vertices = this.vertices;
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
		console.log({faces});
		return faces;
	}

	private _populateAdjacency(faces: Face[][]) {
		const vertices = this.vertices;

		this.adjacency = Array.from({length: vertices.length}, () => new Array());
		const adjacency = this.adjacency;

		// compute sorted adjacency list for every vertex
		for (let r = 0; r < faces.length; r++) {
			let n = faces[r][0];

			// cycle in a fan, through all faces of the vertex
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
			}
		}

		console.log({adjacency});
		console.log(ArrayUtils.uniq(adjacency.map((a) => a.length)));
		const countByLength: Map<number, number> = new Map();
		for (let elem of adjacency) {
			const count = elem.length;
			const currentCount = countByLength.get(count);
			if (currentCount == null) {
				countByLength.set(count, 1);
			} else {
				countByLength.set(count, currentCount + 1);
			}
		}
		countByLength.forEach((count, length) => {
			console.log(`${length} -> ${count}`);
		});
	}
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
