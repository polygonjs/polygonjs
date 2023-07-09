import {BufferGeometry, Mesh, Vector2} from 'three';
import {ThreeMeshBVHHelper} from '../../geometry/bvh/ThreeMeshBVHHelper';
import {unpackAdjacency3, POPULATE_ADJACENCY_DEFAULT} from '../../geometry/operation/Adjacency';
import {textureSizeFromPointsCount} from '../../geometry/operation/TextureFromAttribute';

export class ClothGeometryInitController {
	public adjacency: number[][] = [];
	public geometry: BufferGeometry;
	public readonly resolution = new Vector2();
	constructor(public mesh: Mesh) {
		this.geometry = mesh.geometry;

		ThreeMeshBVHHelper.assignDefaultBVHIfNone(this.mesh);
		this.adjacency = unpackAdjacency3(this.mesh, POPULATE_ADJACENCY_DEFAULT);

		textureSizeFromPointsCount(this.geometry, this.resolution);
	}
}
