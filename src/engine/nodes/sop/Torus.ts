import {TorusBufferGeometry} from 'three/src/geometries/TorusGeometry';
import {TypedSopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class TorusSopParamsConfig extends NodeParamsConfig {
	radius = ParamConfig.FLOAT(1, {range: [0, 1]});
	radius_tube = ParamConfig.FLOAT(1, {range: [0, 1]});
	segments_radial = ParamConfig.INTEGER(20, {
		range: [1, 50],
		range_locked: [true, false],
	});
	segments_tube = ParamConfig.INTEGER(12, {
		range: [1, 50],
		range_locked: [true, false],
	});
}
const ParamsConfig = new TorusSopParamsConfig();

export class TorusSopNode extends TypedSopNode<TorusSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'torus';
	}
	initialize_node() {}

	cook() {
		const radius = this.pv.radius;
		const radius_tube = this.pv.radius_tube;
		const segments_radial = this.pv.segments_radial;
		const segments_tube = this.pv.segments_tube;
		//radius : Float, tube : Float, radialSegments : Integer, tubularSegments : Integer, arc : Float

		const geometry = new TorusBufferGeometry(radius, radius_tube, segments_radial, segments_tube);
		this.set_geometry(geometry);
	}
}
