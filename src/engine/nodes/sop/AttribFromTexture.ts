/**
 * Reads a texture and assigns a value to an attribute.
 *
 * @remarks
 * This can be useful for heightmaps for instance.
 *
 */
import {TypedSopNode} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {AttribFromTextureSopOperation} from '../../../core/operations/sop/AttribFromTexture';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribFromTextureSopOperation.DEFAULT_PARAMS;
class AttribFromTextureSopParamsConfig extends NodeParamsConfig {
	/** @param texture node */
	texture = ParamConfig.NODE_PATH(DEFAULT.texture.path(), {
		node_selection: {context: NodeContext.COP},
	});
	/** @param uv attribute */
	uv_attrib = ParamConfig.STRING(DEFAULT.uv_attrib);
	/** @param attribute to set the value to */
	attrib = ParamConfig.STRING(DEFAULT.attrib);
	/** @param value to add to the attribute */
	add = ParamConfig.FLOAT(DEFAULT.add);
	/** @param value to multiply the attribute with */
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
