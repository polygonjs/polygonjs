/**
 * Creates a tetrahedron
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {TetrahedronBufferGeometry} from '../../../core/geometry/operation/Tetrahedron';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ObjectType} from '../../../core/geometry/Constant';
class TetrahedronSopParamsConfig extends NodeParamsConfig {
	/** @param radius of the tetrahedron */
	radius = ParamConfig.FLOAT(1);
	/** @param resolution of the tetrahedron */
	detail = ParamConfig.INTEGER(0, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param sets to create only points */
	points_only = ParamConfig.BOOLEAN(0);
	/** @param center of the tetrahedron */
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
			this.setObject(object);
		} else {
			geometry.computeVertexNormals();
			this.setGeometry(geometry);
		}
	}
}
