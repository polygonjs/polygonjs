import {Object3D} from 'three';
import {Mesh} from 'three';
import {MeshBVH, acceleratedRaycast, BufferGeometryWithBVH} from './three-mesh-bvh';

export class ThreeMeshBVHHelper {
	static assignBVH(mesh: Mesh, bvh?: MeshBVH) {
		mesh.raycast = acceleratedRaycast;
		bvh = bvh || new MeshBVH(mesh.geometry, {verbose: false});
		(mesh.geometry as BufferGeometryWithBVH).boundsTree = bvh;
	}
	static copyBVH(meshDest: Mesh, meshSrc: Object3D) {
		const existingBVH = (meshSrc as Mesh).geometry?.boundsTree;
		if (existingBVH) {
			meshDest.raycast = acceleratedRaycast;
			this.assignBVH(meshDest, existingBVH);
		}
	}
}
