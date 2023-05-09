import {Object3D, Raycaster, Mesh} from 'three';
import {MeshBVH, acceleratedRaycast, BufferGeometryWithBVH, CENTER, RaycasterForBVH} from './three-mesh-bvh';

export interface ThreeMeshBVHHelperOptions {
	strategy: number;
	maxLeafTris: number;
	maxDepth: number;
	verbose: boolean;
}
export class ThreeMeshBVHHelper {
	static assignBVH(mesh: Mesh, bvh: MeshBVH) {
		mesh.raycast = acceleratedRaycast;
		// bvh = bvh || new MeshBVH(mesh.geometry, {verbose: false});
		(mesh.geometry as BufferGeometryWithBVH).boundsTree = bvh;
	}
	static assignDefaultBVHIfNone(mesh: Mesh) {
		let bvh = (mesh.geometry as BufferGeometryWithBVH).boundsTree || this.defaultBVH(mesh);
		this.assignBVH(mesh, bvh);
	}
	static createBVH(mesh: Mesh, options: ThreeMeshBVHHelperOptions) {
		return new MeshBVH(mesh.geometry, options);
	}
	private static defaultBVH(mesh: Mesh) {
		return this.createBVH(mesh, {strategy: CENTER, maxLeafTris: 10, maxDepth: 40, verbose: false});
	}
	static copyBVH(meshDest: Mesh, meshSrc: Object3D) {
		const existingBVH = ((meshSrc as Mesh).geometry as BufferGeometryWithBVH).boundsTree;
		if (existingBVH) {
			meshDest.raycast = acceleratedRaycast;
			this.assignBVH(meshDest, existingBVH);
		}
	}
	static updateRaycaster(raycaster: Raycaster) {
		(raycaster as RaycasterForBVH).firstHitOnly = true;
	}
}
