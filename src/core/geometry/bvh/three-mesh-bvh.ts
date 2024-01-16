import type {BufferGeometry, Mesh, Raycaster} from 'three';
import {
	computeBoundsTree,
	disposeBoundsTree,
	acceleratedRaycast,
	MeshBVH,
	MeshBVHHelper,
	ExtendedTriangle,
	CENTER,
	AVERAGE,
	SAH,
	StaticGeometryGenerator,
} from 'three-mesh-bvh';
export {
	computeBoundsTree,
	disposeBoundsTree,
	acceleratedRaycast,
	MeshBVH,
	MeshBVHHelper,
	ExtendedTriangle,
	CENTER,
	AVERAGE,
	SAH,
	StaticGeometryGenerator,
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
export class MeshBVHUniformStruct {
	updateFrom(bvh: MeshBVH) {}
	dispose() {}
}
