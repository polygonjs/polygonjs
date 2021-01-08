/**
 * Texture properties
 *
 * @remarks
 * Performance tip: If possible, try to set min filter to LinearFilter in order to avoid the generation of mipmaps.
 * [https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491](https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491)
 */
import {Texture} from 'three/src/textures/Texture';
import {TypedCopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class TexturePropertiesCopParamsConfig extends TextureParamConfig(NodeParamsConfig) {}

const ParamsConfig = new TexturePropertiesCopParamsConfig();

export class TexturePropertiesCopNode extends TypedCopNode<TexturePropertiesCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'textureProperties';
	}

	public readonly texture_params_controller: TextureParamsController = new TextureParamsController(this);
	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE]);
	}
	async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this.texture_params_controller.update(texture);
		this.set_texture(texture);
	}
}
