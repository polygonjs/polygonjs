import {CATEGORY_MAT} from './Category';

import {MeshBasicMatNode} from '../../../nodes/mat/MeshBasic';
import {MeshBasicBuilderMatNode} from '../../../nodes/mat/MeshBasicBuilder';
import {MeshLambertMatNode} from '../../../nodes/mat/MeshLambert';
import {MeshLambertBuilderMatNode} from '../../../nodes/mat/MeshLambertBuilder';
import {MeshStandardMatNode} from '../../../nodes/mat/MeshStandard';
import {MeshStandardBuilderMatNode} from '../../../nodes/mat/MeshStandardBuilder';
import {MeshTranslucentMatNode} from '../../../nodes/mat/MeshTranslucent';
import {PointsMatNode} from '../../../nodes/mat/Points';
import {PointsBuilderMatNode} from '../../../nodes/mat/PointsBuilder';
import {VolumeMatNode} from '../../../nodes/mat/Volume';
import {VolumeBuilderMatNode} from '../../../nodes/mat/VolumeBuilder';

export interface MatNodeChildrenMap {
	mesh_basic: MeshBasicMatNode;
	mesh_basic_builder: MeshBasicBuilderMatNode;
	mesh_lambert: MeshLambertMatNode;
	mesh_lambert_builder: MeshLambertBuilderMatNode;
	mesh_standard: MeshStandardMatNode;
	mesh_standard_builder: MeshStandardBuilderMatNode;
	mesh_translucent: MeshTranslucentMatNode;
	points: PointsMatNode;
	points_builder: PointsBuilderMatNode;
	volume: VolumeMatNode;
	volume_builder: VolumeBuilderMatNode;
}

import {Poly} from '../../../Poly';
export class MatRegister {
	static run(poly: Poly) {
		poly.register_node(MeshBasicMatNode, CATEGORY_MAT.MESH);
		poly.register_node(MeshBasicBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.register_node(MeshLambertMatNode, CATEGORY_MAT.MESH);
		poly.register_node(MeshLambertBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.register_node(MeshStandardMatNode, CATEGORY_MAT.MESH);
		poly.register_node(MeshStandardBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.register_node(MeshTranslucentMatNode, CATEGORY_MAT.MESH);
		poly.register_node(PointsMatNode, CATEGORY_MAT.POINTS);
		poly.register_node(PointsBuilderMatNode, CATEGORY_MAT.ADVANCED);
		poly.register_node(VolumeMatNode, CATEGORY_MAT.VOLUME);
		poly.register_node(VolumeBuilderMatNode, CATEGORY_MAT.VOLUME);
	}
}
