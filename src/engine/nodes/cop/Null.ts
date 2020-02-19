import {Texture} from 'three/src/textures/Texture';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';

const ParamsConfig = new NodeParamsConfig();
export class NullCopNode extends TypedCopNode<NodeParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.NEVER]);
	}

	async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this.set_texture(texture);
	}
}
