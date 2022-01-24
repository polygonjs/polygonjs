/**
 * Simply makes a copy of the texture
 *
 */

import {Texture} from 'three/src/textures/Texture';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';

const ParamsConfig = new NodeParamsConfig();
export class NullCopNode extends TypedCopNode<NodeParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'null';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this.setTexture(texture);
	}
}
