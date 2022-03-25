import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Raycaster} from 'three/src/core/Raycaster';
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
