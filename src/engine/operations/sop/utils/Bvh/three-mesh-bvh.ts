import {BufferGeometry} from 'three';
import {Mesh} from 'three';
import {Raycaster} from 'three';
import {
	computeBoundsTree,
	disposeBoundsTree,
	acceleratedRaycast,
	MeshBVH,
	MeshBVHVisualizer,
	ExtendedTriangle,
} from 'three-mesh-bvh';
export {computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVH, MeshBVHVisualizer, ExtendedTriangle};
export type ShapecastIntersection = number;

export interface BufferGeometryWithBVH extends BufferGeometry {
	boundsTree: MeshBVH;
}
export interface MeshWithBVH extends Mesh {
	geometry: BufferGeometryWithBVH;
}
export interface RaycasterForBVH extends Raycaster {
	firstHitOnly: boolean;
}
