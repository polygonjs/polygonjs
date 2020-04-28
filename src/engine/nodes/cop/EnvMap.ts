import {Texture} from 'three/src/textures/Texture';
// import {NearestFilter} from 'three/src/constants';
// import {LinearEncoding} from 'three/src/constants';
// import {HalfFloatType} from 'three/src/constants';
// import {WebGLRenderTargetCube} from 'three/src/renderers/WebGLRenderTargetCube';
import {PMREMGenerator} from 'three/src/extras/PMREMGenerator';

// import NodeBase from '../_Base'

import {TypedCopNode} from './_Base';
// import {BaseParam} from '../../../Engine/Param/_Base'
// import {CoreTextureLoader} from '../../../core/loader/Texture';
// import { CoreScriptLoader } from "src/Core/Loader/Script";
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Poly} from '../../Poly';
class EnvMapCopParamsConfig extends NodeParamsConfig {
	// url = ParamConfig.STRING(CoreTextureLoader.PARAM_DEFAULT, {
	// 	desktop_browse: {file_type: 'texture'},
	// });
}
const ParamsConfig = new EnvMapCopParamsConfig();
export class EnvMapCopNode extends TypedCopNode<EnvMapCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'env_map';
	}
	// static required_three_imports() {
	// 	return [
	// 		'loaders/EXRLoader',
	// 		// 'pmrem/PMREMGenerator',
	// 		// 'pmrem/PMREMCubeUVPacker',
	// 	];
	// }

	// private _texture_loader: CoreTextureLoader

	initialize_node() {
		this.io.inputs.set_count(1);

		// for now, if I clone the input, it gets messed up
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	// create_params() {
	// 	// this.add_param(ParamType.STRING, 'url', CoreTextureLoader.PARAM_DEFAULT)
	// }

	async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		const env_map = await this.convert_texture_to_env_map(texture);
		if (env_map) {
			this.set_texture(env_map);
		} else {
			this.cook_controller.end_cook();
		}
	}

	private async convert_texture_to_env_map(texture: Texture): Promise<Texture | undefined> {
		// texture.minFilter = NearestFilter;
		// texture.encoding = LinearEncoding;

		const renderer = await Poly.instance().renderers_controller.wait_for_renderer();
		// if (!renderer) {
		// 	await CoreSleep.sleep(1000);
		// 	console.log('waited 1s');
		// 	renderer = POLY.renderers_controller.first_renderer();
		// 	console.log('renderer', renderer, texture);
		// }

		if (renderer) {
			const pmremGenerator = new PMREMGenerator(renderer);
			// console.log('env inout', texture);
			const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

			// pmremGenerator.dispose();
			// texture.dispose();
			// console.log('exrCubeRenderTarget.texture', exrCubeRenderTarget.texture);
			const env_map_texture = exrCubeRenderTarget.texture;
			// (window.scene as any).background = env_map_texture;
			// (window.scene as any).environment = env_map_texture;
			return env_map_texture;
		} else {
			this.states.error.set('no renderer found to convert the texture to an env map');
		}
	}
}
