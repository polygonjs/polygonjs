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
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'textureProperties';
	}

	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE]);
	}
	override async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this.textureParamsController.update(texture);
		this.setTexture(texture);
	}
}
