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
		nodeSelection: {context: NodeContext.COP},
	});
	/** @param uv attribute */
	uvAttrib = ParamConfig.STRING(DEFAULT.uvAttrib);
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
		return 'attribFromTexture';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.attrib]);
			});
		});
	}

	private _operation: AttribFromTextureSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribFromTextureSopOperation(this.scene(), this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
