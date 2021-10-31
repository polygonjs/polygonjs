import {Raycaster} from 'three/src/core/Raycaster';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Color} from 'three/src/math/Color';
import {Group} from 'three/src/objects/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';

interface MeshBVHOptions {
	verbose: boolean;
}

export class MeshBVH {
	constructor(geo: BufferGeometry, options: MeshBVHOptions);
}
export function acceleratedRaycast(): void;
export class BufferGeometryWithBvh extends BufferGeometry {
	boundsTree: MeshBVH;
}
export class RaycasterForBVH extends Raycaster {
	firstHitOnly: boolean;
}
export class MeshBVHVisualizer extends Group {
	constructor(mesh: Mesh, depth: number);
	depth: number;
	color: Color;
	opacity: number;
	displayParents: boolean;
	displayEdges: boolean;
	edgeMaterial: Material;
	meshMaterial: Material;
	update(): void;
	dispose(): void;
}
