/**
 * Creates an environment map
 *
 *
 */
import {Texture} from 'three/src/textures/Texture';
import {PMREMGenerator} from 'three/src/extras/PMREMGenerator';
import {TypedCopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
import {CopRendererController} from './utils/RendererController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';

import {CubeUVReflectionMapping} from 'three/src/constants';

// enum MapMode {
// 	REFLECTION = 'reflection',
// 	REFRACTION = 'refraction',
// }
// const MAP_MODES: MapMode[] = [MapMode.REFLECTION, MapMode.REFRACTION];

class EnvMapCopParamsConfig extends NodeParamsConfig {
	/** @param defines if the shader is rendered via the same camera used to render the scene */
	useCameraRenderer = ParamConfig.BOOLEAN(1);
	/** @param defines if the texture is used for reflection or refraction */
	// mode = ParamConfig.INTEGER(0, {
	// 	menu: {
	// 		entries: MAP_MODES.map((name, value) => {
	// 			return {name, value};
	// 		}),
	// 	},
	// });
}
const ParamsConfig = new EnvMapCopParamsConfig();
export class EnvMapCopNode extends TypedCopNode<EnvMapCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'envMap';
	}
	private _data_texture_controller: DataTextureController | undefined;
	private _renderer_controller: CopRendererController | undefined;

	override initializeNode() {
		this.io.inputs.setCount(1);

		// for now, if I clone the input, it gets messed up
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this._convertTextureToEnvMap(texture);
	}

	private async _convertTextureToEnvMap(input_texture: Texture) {
		this._renderer_controller = this._renderer_controller || new CopRendererController(this);
		const renderer = await this._renderer_controller.renderer();

		if (renderer) {
			const pmremGenerator = new PMREMGenerator(renderer);
			const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(input_texture);

			// pmremGenerator.dispose();
			// texture.dispose();

			if (isBooleanTrue(this.pv.useCameraRenderer)) {
				this._setMapping(exrCubeRenderTarget.texture);
				this.setTexture(exrCubeRenderTarget.texture);
			} else {
				this._data_texture_controller =
					this._data_texture_controller ||
					new DataTextureController(DataTextureControllerBufferType.Uint16Array);
				const texture = this._data_texture_controller.from_render_target(renderer, exrCubeRenderTarget);
				this._setMapping(texture);
				this.setTexture(texture);
			}
		} else {
			this.states.error.set('no renderer found to convert the texture to an env map');
			this.cookController.endCook();
		}
	}
	private _setMapping(texture: Texture) {
		// if (MAP_MODES[this.pv.mode] == MapMode.REFLECTION) {
		texture.mapping = CubeUVReflectionMapping;
		// } else {
		// 	texture.mapping = CubeUVRefractionMapping;
		// }
	}
}
