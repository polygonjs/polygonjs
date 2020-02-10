import {CATEGORY_MAT} from './Category';

import {MeshBasicMatNode} from 'src/engine/nodes/mat/MeshBasic';
import {MeshLambertMatNode} from 'src/engine/nodes/mat/MeshLambert';
import {MeshStandardMatNode} from 'src/engine/nodes/mat/MeshStandard';

export interface MatNodeChildrenMap {
	mesh_basic: MeshBasicMatNode;
	mesh_lambert: MeshLambertMatNode;
	mesh_standard: MeshStandardMatNode;
}

import {Poly} from 'src/engine/Poly';
export class MatRegister {
	static run(poly: Poly) {
		poly.register_node(MeshBasicMatNode, CATEGORY_MAT.MESH);
		poly.register_node(MeshLambertMatNode, CATEGORY_MAT.MESH);
		poly.register_node(MeshStandardMatNode, CATEGORY_MAT.MESH);
	}
}
