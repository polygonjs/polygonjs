import {TypedSopNode} from './_Base';
// import {TetrahedronBufferGeometry} from 'three/src/geometries/TetrahedronGeometry';
import {TetrahedronBufferGeometry} from '../../../core/geometry/operation/Tetrahedron';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ObjectType} from '../../../core/geometry/Constant';
class TetrahedronSopParamsConfig extends NodeParamsConfig {
	radius = ParamConfig.FLOAT(1);
	detail = ParamConfig.INTEGER(0, {
		range: [0, 10],
		range_locked: [true, false],
	});
	points_only = ParamConfig.BOOLEAN(0);
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new TetrahedronSopParamsConfig();

export class TetrahedronSopNode extends TypedSopNode<TetrahedronSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'tetrahedron';
	}

	cook() {
		const points_only = this.pv.points_only;
		const geometry = new TetrahedronBufferGeometry(this.pv.radius, this.pv.detail, points_only);
		geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);
		if (points_only) {
			const object = this.create_object(geometry, ObjectType.POINTS);
			this.set_object(object);
		} else {
			geometry.computeVertexNormals();
			this.set_geometry(geometry);
		}
	}
}
