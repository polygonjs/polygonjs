import {TypedSopNode} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {MaterialSopOperation} from '../../../core/operation/sop/Material';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = MaterialSopOperation.DEFAULT_PARAMS;
class MaterialSopParamsConfig extends NodeParamsConfig {
	group = ParamConfig.STRING(DEFAULT.group);
	material = ParamConfig.NODE_PATH(DEFAULT.material.path(), {
		node_selection: {
			context: NodeContext.MAT,
		},
		dependent_on_found_node: false,
	});
	apply_to_children = ParamConfig.BOOLEAN(DEFAULT.apply_to_children);
	clone_mat = ParamConfig.BOOLEAN(DEFAULT.clone_mat);
	swap_current_tex = ParamConfig.BOOLEAN(DEFAULT.swap_current_tex);
	tex_src0 = ParamConfig.STRING(DEFAULT.tex_src0, {visible_if: {swap_current_tex: 1}});
	tex_dest0 = ParamConfig.STRING(DEFAULT.tex_dest0, {visible_if: {swap_current_tex: 1}});
	// clone_mat is mostly useful when swapping tex for multiple objects which have different textures
	// but can also be used when requiring a unique material per object, when using a copy SOP
}
const ParamsConfig = new MaterialSopParamsConfig();

export class MaterialSopNode extends TypedSopNode<MaterialSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'material';
	}

	static displayed_input_names(): string[] {
		return ['objects to assign material to'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(MaterialSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: MaterialSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new MaterialSopOperation(this._scene, this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
