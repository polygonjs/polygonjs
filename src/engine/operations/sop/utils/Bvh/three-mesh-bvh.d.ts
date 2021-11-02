import {Raycaster} from 'three/src/core/Raycaster';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Color} from 'three/src/math/Color';
import {Group} from 'three/src/objects/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {Box3} from 'three/src/math/Box3';
import {Triangle} from 'three/src/math/Triangle';
import {Line3} from 'three/src/math/Line3';
import {Vector3} from 'three/src/math/Vector3';

export class SeparatingAxisTriangle extends Triangle {
	closestPointToSegment(tempSegment: Line3, triPoint: Vector3, capsulePoint: Vector3): number;
}

interface MeshBVHOptions {
	verbose: boolean;
}
interface ShapeCastOptions {
	intersectsBounds: (box: Box3) => boolean;
	intersectsTriangle: (tri: SeparatingAxisTriangle) => void;
}

export class MeshBVH {
	constructor(geo: BufferGeometry, options: MeshBVHOptions);
	shapecast(args: ShapeCastOptions): void;
}
export function acceleratedRaycast(): void;
export class BufferGeometryWithBVH extends BufferGeometry {
	boundsTree: MeshBVH;
}
export class MeshWithBVH extends Mesh {
	geometry: BufferGeometryWithBVH;
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
