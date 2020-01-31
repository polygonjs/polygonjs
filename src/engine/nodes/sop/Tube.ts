import {TypedSopNode} from './_Base';

import {Vector3} from 'three/src/math/Vector3';
import {CylinderBufferGeometry} from 'three/src/geometries/CylinderGeometry';
import {CoreTransform} from 'src/core/Transform';

const DEFAULT_UP = new Vector3(0, 1, 0);

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class TubeSopParamsConfig extends NodeParamsConfig {
	radius = ParamConfig.FLOAT(1, {range: [0, 1]});
	height = ParamConfig.FLOAT(1, {range: [0, 1]});
	segments_radial = ParamConfig.INTEGER(12, {range: [3, 20], range_locked: [true, false]});
	segments_height = ParamConfig.INTEGER(1, {range: [1, 20], range_locked: [true, false]});
	cap = ParamConfig.BOOLEAN(1);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	direction = ParamConfig.VECTOR3([0, 0, 1]);
}
const ParamsConfig = new TubeSopParamsConfig();

export class TubeSopNode extends TypedSopNode<TubeSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'tube';
	}

	private _core_transform = new CoreTransform();

	cook() {
		const geometry = new CylinderBufferGeometry(
			this.pv.radius,
			this.pv.radius,
			this.pv.height,
			this.pv.segments_radial,
			this.pv.segments_height,
			!this.pv.cap
		);

		this._core_transform.rotate_geometry(geometry, DEFAULT_UP, this.pv.direction);
		geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);

		this.set_geometry(geometry);
	}
}
