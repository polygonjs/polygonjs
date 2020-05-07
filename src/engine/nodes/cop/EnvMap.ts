import {Texture} from 'three/src/textures/Texture';
import {PMREMGenerator} from 'three/src/extras/PMREMGenerator';
import {TypedCopNode} from './_Base';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {DataTexture} from 'three/src/textures/DataTexture';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class EnvMapCopParamsConfig extends NodeParamsConfig {
	use_data_texture = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new EnvMapCopParamsConfig();
export class EnvMapCopNode extends TypedCopNode<EnvMapCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'env_map';
	}

	initialize_node() {
		this.io.inputs.set_count(1);

		// for now, if I clone the input, it gets messed up
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}
	private _data_texture: DataTexture | undefined;

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
			// console.log('env inout', texture);
			const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(input_texture);

			// pmremGenerator.dispose();
			// texture.dispose();
			let texture = exrCubeRenderTarget.texture;

			if (this.pv.use_data_texture) {
				texture = this._copy_to_data_texture(renderer, exrCubeRenderTarget);
			}
			return texture;
		} else {
			this.states.error.set('no renderer found to convert the texture to an env map');
		}
	}

	private _copy_to_data_texture(renderer: WebGLRenderer, render_target: WebGLRenderTarget) {
		const image = render_target.texture.image;
		this._data_texture = this._data_texture || this._create_data_texture(render_target);
		renderer.readRenderTargetPixels(render_target, 0, 0, image.width, image.height, this._data_texture.image.data);
		this._data_texture.needsUpdate = true;
		return this._data_texture;
	}
	private _create_data_texture(render_target: WebGLRenderTarget) {
		const texture = render_target.texture;
		const image = texture.image;
		const pixel_buffer = this._create_pixel_buffer(image.width, image.height);
		const data_texture = new DataTexture(
			pixel_buffer,
			image.width,
			image.height,
			texture.format,
			texture.type,
			texture.mapping,
			texture.wrapS,
			texture.wrapT,
			texture.magFilter,
			texture.minFilter,
			texture.anisotropy,
			texture.encoding
		);
		return data_texture;
	}
	private _create_pixel_buffer(width: number, height: number) {
		// Uint8Array, Uint8ClampedArray
		// using Float32 array gives the following error when calling readRenderTargetPixels:
		// WebGL: INVALID_OPERATION: texImage2D: type UNSIGNED_BYTE but ArrayBufferView not Uint8Array or Uint8ClampedArray
		return new Uint8Array(width * height * 4);
	}
}
