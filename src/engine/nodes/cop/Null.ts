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
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this.set_texture(texture);
	}
}
