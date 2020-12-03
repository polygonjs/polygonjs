import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ROTATION_ORDERS, TransformTargetType, TRANSFORM_TARGET_TYPES} from '../../../core/Transform';
import {TransformSopOperation} from '../../../core/operations/sop/Transform';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TransformSopOperation.DEFAULT_PARAMS;
class TransformSopParamConfig extends NodeParamsConfig {
	apply_on = ParamConfig.INTEGER(DEFAULT.apply_on, {
		menu: {
			entries: TRANSFORM_TARGET_TYPES.map((target_type, i) => {
				return {name: target_type, value: i};
			}),
		},
	});
	group = ParamConfig.STRING(DEFAULT.group, {
		visible_if: {apply_on: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES)},
	});

	// transform
	rotation_order = ParamConfig.INTEGER(DEFAULT.rotation_order, {
		menu: {
			entries: ROTATION_ORDERS.map((order, v) => {
				return {name: order, value: v};
			}),
		},
	});
	t = ParamConfig.VECTOR3(DEFAULT.t);
	r = ParamConfig.VECTOR3(DEFAULT.r);
	s = ParamConfig.VECTOR3(DEFAULT.s);
	scale = ParamConfig.FLOAT(DEFAULT.scale, {range: [0, 10]});
	// look_at = ParamConfig.OPERATOR_PATH('');
	// up = ParamConfig.VECTOR3([0, 1, 0]);
	pivot = ParamConfig.VECTOR3(DEFAULT.pivot, {
		visible_if: {apply_on: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES)},
	});
}
const ParamsConfig = new TransformSopParamConfig();

export class TransformSopNode extends TypedSopNode<TransformSopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'transform';
	}

	static displayed_input_names(): string[] {
		return ['geometries or objects to transform'];
	}

	initialize_node() {
		// this.ui_data.set_param_label(this.p.apply_on, (v)=>TARGET_TYPES[v])
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(TransformSopOperation.INPUT_CLONED_STATE);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.apply_on], () => {
					return TRANSFORM_TARGET_TYPES[this.pv.apply_on];
				});
			});
		});
	}

	private _operation: TransformSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TransformSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
