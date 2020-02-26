import {CATEGORY_MAT} from './Category';

import {MeshBasicMatNode} from '../../nodes/mat/MeshBasic';
import {MeshBasicBuilderMatNode} from '../../nodes/mat/MeshBasicBuilder';
import {MeshLambertMatNode} from '../../nodes/mat/MeshLambert';
import {MeshStandardMatNode} from '../../nodes/mat/MeshStandard';
import {PointsMatNode} from '../../nodes/mat/Points';

export interface MatNodeChildrenMap {
	mesh_basic: MeshBasicMatNode;
	mesh_basic_builder: MeshBasicBuilderMatNode;
	mesh_lambert: MeshLambertMatNode;
	mesh_standard: MeshStandardMatNode;
	points: PointsMatNode;
}

import {Poly} from '../../Poly';
export class MatRegister {
	static run(poly: Poly) {
		poly.register_node(MeshBasicMatNode, CATEGORY_MAT.MESH);
		poly.register_node(MeshBasicBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.register_node(MeshLambertMatNode, CATEGORY_MAT.MESH);
		poly.register_node(MeshStandardMatNode, CATEGORY_MAT.MESH);
		poly.register_node(PointsMatNode, CATEGORY_MAT.POINTS);
	}
}
