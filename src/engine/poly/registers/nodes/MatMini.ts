import {CATEGORY_MAT} from './Category';

import {MeshBasicMatNode} from '../../../nodes/mat/MeshBasic';

export interface MatNodeChildrenMap {
	meshBasic: MeshBasicMatNode;
}

import {PolyEngine} from '../../../Poly';
export class MatRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(MeshBasicMatNode, CATEGORY_MAT.MESH);
	}
}
