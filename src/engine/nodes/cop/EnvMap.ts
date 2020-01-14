// import {Texture} from 'three/src/textures/Texture';
// import {NearestFilter} from 'three/src/constants';
// import {LinearEncoding} from 'three/src/constants';
// import {HalfFloatType} from 'three/src/constants';
// import {WebGLRenderTargetCube} from 'three/src/renderers/WebGLRenderTargetCube';
// import {PMREMGenerator} from 'three/src/extras/PMREMGenerator';

// // import NodeBase from '../_Base'

// import {BaseNodeCop} from './_Base';
// // import {BaseParam} from 'src/Engine/Param/_Base'
// // import {CoreTextureLoader} from 'src/Core/Loader/Texture'
// // import { CoreScriptLoader } from "src/Core/Loader/Script";

// export class EnvMap extends BaseNodeCop {
// 	static type() {
// 		return 'env_map';
// 	}
// 	static required_three_imports() {
// 		return [
// 			'loaders/EXRLoader',
// 			// 'pmrem/PMREMGenerator',
// 			// 'pmrem/PMREMCubeUVPacker',
// 		];
// 	}

// 	// private _texture_loader: CoreTextureLoader

// 	initialize_node() {

// 		this.io.inputs.set_inputs_count(1);

// 		// for now, if I clone the input, it gets messed up
// 		this.init_inputs_clonable_state([POLY.InputCloneMode.NEVER]);
// 	}

// 	create_params() {
// 		// this.add_param(ParamType.STRING, 'url', CoreTextureLoader.PARAM_DEFAULT)
// 	}

// 	async cook(input_contents: Texture[]) {
// 		const texture = input_contents[0];
// 		const env_map = this.convert_texture_to_env_map(texture);
// 		this.set_texture(env_map);
// 	}

// 	private convert_texture_to_env_map(texture: Texture): Texture {
// 		texture.minFilter = NearestFilter;
// 		texture.encoding = LinearEncoding;

// 		const renderer = POLY.renderers_controller.first_renderer();
// 		if (renderer) {
// 			const pmremGenerator = new PMREMGenerator(renderer);
// 			const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

// 			pmremGenerator.dispose();
// 			texture.dispose();

// 			return exrCubeRenderTarget.texture;
// 		} else {
// 			this.states.error.set('no renderer found to convert the texture to an env map');
// 		}
// 	}
// }
