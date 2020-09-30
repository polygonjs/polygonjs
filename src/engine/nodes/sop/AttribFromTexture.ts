import {TypedSopNode} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {AttribFromTextureSopOperation} from '../../../core/operation/sop/AttribFromTexture';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribFromTextureSopOperation.DEFAULT_PARAMS;
class AttribFromTextureSopParamsConfig extends NodeParamsConfig {
	texture = ParamConfig.NODE_PATH(DEFAULT.texture.path(), {
		node_selection: {context: NodeContext.COP},
	});
	uv_attrib = ParamConfig.STRING(DEFAULT.uv_attrib);
	attrib = ParamConfig.STRING(DEFAULT.attrib);
	add = ParamConfig.FLOAT(DEFAULT.add);
	mult = ParamConfig.FLOAT(DEFAULT.mult);
}
const ParamsConfig = new AttribFromTextureSopParamsConfig();

export class AttribFromTextureSopNode extends TypedSopNode<AttribFromTextureSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_from_texture';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.attrib]);
			});
		});
	}

	private _operation: AttribFromTextureSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribFromTextureSopOperation(this.scene, this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
