import {Texture} from 'three/src/textures/Texture';
import {PMREMGenerator} from 'three/src/extras/PMREMGenerator';
import {TypedCopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
class EnvMapCopParamsConfig extends NodeParamsConfig {
	use_data_texture = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new EnvMapCopParamsConfig();
export class EnvMapCopNode extends TypedCopNode<EnvMapCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'env_map';
	}
	private _data_texture_controller: DataTextureController | undefined;

	initialize_node() {
		this.io.inputs.set_count(1);

		// for now, if I clone the input, it gets messed up
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		const env_map = await this.convert_texture_to_env_map(texture);
		if (env_map) {
			this.set_texture(env_map);
		} else {
			this.cook_controller.end_cook();
		}
	}

	private async convert_texture_to_env_map(input_texture: Texture): Promise<Texture | undefined> {
		// texture.minFilter = NearestFilter;
		// texture.encoding = LinearEncoding;

		let renderer = Poly.instance().renderers_controller.first_renderer();
		if (!renderer) {
			renderer = await Poly.instance().renderers_controller.wait_for_renderer();
		}

		if (renderer) {
			const pmremGenerator = new PMREMGenerator(renderer);
			const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(input_texture);

			// pmremGenerator.dispose();
			// texture.dispose();
			let texture = exrCubeRenderTarget.texture;

			if (this.pv.use_data_texture) {
				this._data_texture_controller =
					this._data_texture_controller ||
					new DataTextureController(DataTextureControllerBufferType.Uint8Array);
				texture = this._data_texture_controller.from_render_target(renderer, exrCubeRenderTarget);
			}
			return texture;
		} else {
			this.states.error.set('no renderer found to convert the texture to an env map');
		}
	}
}
