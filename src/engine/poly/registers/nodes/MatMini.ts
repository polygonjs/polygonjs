import {CATEGORY_MAT} from './Category';

import {MeshBasicMatNode} from '../../../nodes/mat/MeshBasic';
import {MeshStandardMatNode} from '../../../nodes/mat/MeshStandard';

export interface MatNodeChildrenMap {
	meshBasic: MeshBasicMatNode;
	meshStandard: MeshStandardMatNode;
}

import {PolyEngine} from '../../../Poly';
export class MatRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(MeshBasicMatNode, CATEGORY_MAT.MESH);
		poly.registerNode(MeshStandardMatNode, CATEGORY_MAT.MESH);
	}
}
