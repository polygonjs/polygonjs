import {Mesh} from 'three/src/objects/Mesh';
import {Matrix4} from 'three/src/math/Matrix4';
import {Material} from 'three/src/materials/Material';

export class CSGResult {
	intersect(result: CSGResult): CSGResult;
	union(result: CSGResult): CSGResult;
	subtract(result: CSGResult): CSGResult;
}
export class CSG {
	static fromMesh(mesh: Mesh): CSGResult;
	static toMesh(result: CSGResult, matrix: Matrix4, material: Material | Material[]): Mesh;
}
