import {TorusKnotBufferGeometry} from 'three/src/geometries/TorusKnotGeometry';
const THREE = {TorusKnotBufferGeometry};
import {TypedSopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class TorusKnotSopParamsConfig extends NodeParamsConfig {
	radius = ParamConfig.FLOAT(1);
	radius_tube = ParamConfig.FLOAT(1);
	segments_radial = ParamConfig.INTEGER(64, {range: [1, 128]});
	segments_tube = ParamConfig.INTEGER(8, {range: [1, 32]});
	p = ParamConfig.INTEGER(2, {range: [1, 10]});
	q = ParamConfig.INTEGER(3, {range: [1, 10]});
}
const ParamsConfig = new TorusKnotSopParamsConfig();

export class TorusKnotSopNode extends TypedSopNode<TorusKnotSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'torus_knot';
	}
	initialize_node() {}

	cook() {
		const radius = this.pv.radius;
		const radius_tube = this.pv.radius_tube;
		const segments_radial = this.pv.segments_radial;
		const segments_tube = this.pv.segments_tube;
		const p = this.pv.p;
		const q = this.pv.q;

		const geometry = new THREE.TorusKnotBufferGeometry(radius, radius_tube, segments_radial, segments_tube, p, q);
		this.set_geometry(geometry);
	}
}
