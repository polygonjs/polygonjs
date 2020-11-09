import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TexturePropertiesSopOperation} from '../../../core/operation/sop/TextureProperties';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TexturePropertiesSopOperation.DEFAULT_PARAMS;
class TexturePropertiesSopParamsConfig extends NodeParamsConfig {
	apply_to_children = ParamConfig.BOOLEAN(DEFAULT.apply_to_children);
	separator = ParamConfig.SEPARATOR();
	tanisotropy = ParamConfig.BOOLEAN(DEFAULT.tanisotropy);
	use_renderer_max_anisotropy = ParamConfig.BOOLEAN(DEFAULT.use_renderer_max_anisotropy, {
		visible_if: {tanisotropy: 1},
	});
	anisotropy = ParamConfig.INTEGER(DEFAULT.anisotropy, {
		visible_if: {tanisotropy: 1, use_renderer_max_anisotropy: 0},
		range: [0, 32],
		range_locked: [true, false],
	});
}
const ParamsConfig = new TexturePropertiesSopParamsConfig();

export class TexturePropertiesSopNode extends TypedSopNode<TexturePropertiesSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'texture_properties';
	}

	static displayed_input_names(): string[] {
		return ['objects with textures to change properties of'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(TexturePropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: TexturePropertiesSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TexturePropertiesSopOperation(this.scene, this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
