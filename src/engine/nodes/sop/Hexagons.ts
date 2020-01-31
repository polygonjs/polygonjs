import {Vector3} from 'three/src/math/Vector3';
import {TypedSopNode} from './_Base';
import {CoreTransform} from 'src/core/Transform';
import {CoreConstant} from 'src/core/geometry/Constant';

import {CoreGeometryOperationHexagon} from 'src/core/geometry/operation/Hexagon';

const DEFAULT_UP = new Vector3(0, 1, 0);

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class HexagonsSopParamsConfig extends NodeParamsConfig {
	size = ParamConfig.VECTOR2([1, 1]);
	hexagon_radius = ParamConfig.FLOAT(0.1);
	direction = ParamConfig.VECTOR3([0, 1, 0]);
	points_only = ParamConfig.BOOLEAN(0);
	// no need to have centers, as all points are centers anyway
	//this.add_param( ParamType.TOGGLE, 'centers_only', 0, {visible_if: {points_only: 1}})
}
const ParamsConfig = new HexagonsSopParamsConfig();

export class HexagonsSopNode extends TypedSopNode<HexagonsSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'hexagons';
	}

	private _core_transform = new CoreTransform();

	initialize_node() {}

	cook() {
		const operation = new CoreGeometryOperationHexagon(this.pv.size, this.pv.hexagon_radius, this.pv.points_only);
		const geometry = operation.process();
		console.log(geometry, geometry.attributes.position);

		this._core_transform.rotate_geometry(geometry, DEFAULT_UP, this.pv.direction);

		if (this.pv.points_only) {
			this.set_geometry(geometry, CoreConstant.OBJECT_TYPE.POINTS);
		} else {
			this.set_geometry(geometry);
		}
	}
}
