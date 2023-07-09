import {
	// Vector3,
	BufferGeometry,
	// BufferAttribute,
	Mesh,
	Vector2,
	// Vector3,
} from 'three';
import {ThreeMeshBVHHelper} from '../../geometry/bvh/ThreeMeshBVHHelper';
import {
	// _adjacencyGroupFaces,
	// _adjacencyVertices,
	// _populateAdjacencyOLD,
	unpackAdjacency3,
	POPULATE_ADJACENCY_DEFAULT,
	// Face,
} from '../../geometry/operation/Adjacency';
import {textureSizeFromPointsCount} from '../../geometry/operation/TextureFromAttribute';

// interface Face {
// 	a: number;
// 	b: number;
// 	c: number;
// }

export class ClothGeometryInitController {
	// private _vertices: Vector3[] = [];
	public adjacency: number[][] = [];
	public geometry: BufferGeometry;
	public readonly resolution = new Vector2();
	constructor(public mesh: Mesh) {
		this.geometry = mesh.geometry;

		ThreeMeshBVHHelper.assignDefaultBVHIfNone(this.mesh);
		this.adjacency = unpackAdjacency3(this.mesh, POPULATE_ADJACENCY_DEFAULT);

		textureSizeFromPointsCount(this.geometry, this.resolution);

		// _adjacencyVertices(this.geometry, this._vertices);
		// const faces = this._groupFaces();
		// if (!faces) {
		// 	return;
		// }
		// this._populateAdjacency(faces);
	}

	// private _groupFaces() {
	// 	const index = this.geometry.index;
	// 	if (!index) {
	// 		console.warn('no index');
	// 		return;
	// 	}
	// 	return _adjacencyGroupFaces(this.geometry, this._vertices);
	// }

	// protected _populateAdjacency(faces: Face[][]) {
	// 	this.adjacency = _populateAdjacencyOLD(faces, this._vertices);
	// 	console.log('old', this.adjacency);
	// }
}
