/**
 * Copies the textures from the second input onto the materials in the first input.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TextureCopySopOperation} from '../../operations/sop/TextureCopy';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TextureCopySopOperation.DEFAULT_PARAMS;
class TextureCopySopParamsConfig extends NodeParamsConfig {
	textureName = ParamConfig.STRING(DEFAULT.textureName);
}
const ParamsConfig = new TextureCopySopParamsConfig();

export class TextureCopySopNode extends TypedSopNode<TextureCopySopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'TextureCopy';
	}

	static override displayedInputNames(): string[] {
		return ['objects to copy textures to', 'objects to copy textures from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(TextureCopySopOperation.INPUT_CLONED_STATE);
	}

	private _operation: TextureCopySopOperation | undefined;
	override async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TextureCopySopOperation(this.scene(), this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
