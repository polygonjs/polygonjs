import type {BufferGeometry, Mesh, Raycaster} from 'three';
import {
	computeBoundsTree,
	disposeBoundsTree,
	acceleratedRaycast,
	MeshBVH,
	MeshBVHVisualizer,
	ExtendedTriangle,
	CENTER,
	AVERAGE,
	SAH,
} from 'three-mesh-bvh';
export {
	computeBoundsTree,
	disposeBoundsTree,
	acceleratedRaycast,
	MeshBVH,
	MeshBVHVisualizer,
	ExtendedTriangle,
	CENTER,
	AVERAGE,
	SAH,
};
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
