import {CATEGORY_MAT} from './Category';

import {MeshBasicMatNode} from 'src/engine/nodes/mat/MeshBasic';
import {MeshBasicBuilderMatNode} from 'src/engine/nodes/mat/MeshBasicBuilder';
import {MeshLambertMatNode} from 'src/engine/nodes/mat/MeshLambert';
import {MeshStandardMatNode} from 'src/engine/nodes/mat/MeshStandard';
import {PointsMatNode} from 'src/engine/nodes/mat/Points';

export interface MatNodeChildrenMap {
	mesh_basic: MeshBasicMatNode;
	mesh_basic_builder: MeshBasicBuilderMatNode;
	mesh_lambert: MeshLambertMatNode;
	mesh_standard: MeshStandardMatNode;
	points: PointsMatNode;
}

import {Poly} from 'src/engine/Poly';
export class MatRegister {
	static run(poly: Poly) {
		poly.register_node(MeshBasicMatNode, CATEGORY_MAT.MESH);
		poly.register_node(MeshBasicBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.register_node(MeshLambertMatNode, CATEGORY_MAT.MESH);
		poly.register_node(MeshStandardMatNode, CATEGORY_MAT.MESH);
		poly.register_node(PointsMatNode, CATEGORY_MAT.POINTS);
	}
}
