import {TypedSopNode} from './_Base';
import {SphereSopOperation, SPHERE_TYPES, SPHERE_TYPE} from '../../../core/operation/sop/Sphere';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = SphereSopOperation.DEFAULT_PARAMS;
class SphereSopParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(DEFAULT.type, {
		menu: {
			entries: SPHERE_TYPES.map((name) => {
				return {name: name, value: SPHERE_TYPE[name]};
			}),
		},
	});
	radius = ParamConfig.FLOAT(DEFAULT.radius, {visible_if: {type: SPHERE_TYPE.default}});
	resolution = ParamConfig.VECTOR2(DEFAULT.resolution, {visible_if: {type: SPHERE_TYPE.default}});
	open = ParamConfig.BOOLEAN(DEFAULT.open, {visible_if: {type: SPHERE_TYPE.default}});
	angle_range_x = ParamConfig.VECTOR2([0, '$PI*2'], {visible_if: {type: SPHERE_TYPE.default, open: true}});
	angle_range_y = ParamConfig.VECTOR2([0, '$PI'], {visible_if: {type: SPHERE_TYPE.default, open: true}});
	detail = ParamConfig.INTEGER(DEFAULT.detail, {
		range: [0, 5],
		range_locked: [true, false],
		visible_if: {type: SPHERE_TYPE.isocahedron},
	});
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new SphereSopParamsConfig();

export class SphereSopNode extends TypedSopNode<SphereSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'sphere';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_cloned_state(SphereSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: SphereSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new SphereSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
