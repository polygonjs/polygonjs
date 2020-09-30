import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {AttribNormalizeSopOperation, NORMALIZE_MODES, NormalizeMode} from '../../../core/operation/sop/AttribNormalize';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribNormalizeSopOperation.DEFAULT_PARAMS;
class AttribNormalizeSopParamsConfig extends NodeParamsConfig {
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: NORMALIZE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	name = ParamConfig.STRING(DEFAULT.name);
	change_name = ParamConfig.BOOLEAN(DEFAULT.change_name);
	new_name = ParamConfig.STRING(DEFAULT.new_name, {visible_if: {change_name: 1}});
}
const ParamsConfig = new AttribNormalizeSopParamsConfig();

export class AttribNormalizeSopNode extends TypedSopNode<AttribNormalizeSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_normalize';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(AttribNormalizeSopOperation.INPUT_CLONED_STATE);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.name]);
			});
		});
	}

	set_mode(mode: NormalizeMode) {
		this.p.mode.set(NORMALIZE_MODES.indexOf(mode));
	}

	private _operation: AttribNormalizeSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribNormalizeSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
