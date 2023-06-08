/**
 * Creates an environment map
 *
 *
 */
import {Texture, WebGLRenderer} from 'three';
import {PMREMGenerator} from 'three';
import {TypedCopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
import {CopRendererController} from './utils/RendererController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';

import {CubeUVReflectionMapping} from 'three';
import {CopType} from '../../poly/registers/nodes/types/Cop';

// enum MapMode {
// 	REFLECTION = 'reflection',
// 	REFRACTION = 'refraction',
// }
// const MAP_MODES: MapMode[] = [MapMode.REFLECTION, MapMode.REFRACTION];

class EnvMapCopParamsConfig extends NodeParamsConfig {
	/** @param defines if the shader is rendered via the same camera used to render the scene */
	useCameraRenderer = ParamConfig.BOOLEAN(1); // needs to be 1, as it does not work on firefox otherwise
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
		return CopType.ENV_MAP;
	}
	private _dataTextureController: DataTextureController | undefined;
	private _rendererController: CopRendererController | undefined;

	override initializeNode() {
		this.io.inputs.setCount(1);

		// for now, if I clone the input, it gets messed up
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(inputTextures: Texture[]) {
		const texture = inputTextures[0];
		await this._convertTextureToEnvMap(texture);
	}

	private async _convertTextureToEnvMap(inputTexture: Texture) {
		this._rendererController = this._rendererController || new CopRendererController(this);

		const renderer = await this._rendererController.waitForRenderer();

		if (!renderer) {
			this.states.error.set('no renderer found to convert the texture to an env map');
			return this.cookController.endCook();
		}

		if (!(renderer instanceof WebGLRenderer)) {
			this.states.error.set('renderer found is not WebGLRenderer');
			console.log({renderer});
			return this.cookController.endCook();
		}

		const pmremGenerator = new PMREMGenerator(renderer);
		const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(inputTexture);

		// pmremGenerator.dispose();
		// texture.dispose();

		if (isBooleanTrue(this.pv.useCameraRenderer)) {
			this._setMapping(exrCubeRenderTarget.texture);
			this.setTexture(exrCubeRenderTarget.texture);
		} else {
			this._dataTextureController =
				this._dataTextureController || new DataTextureController(DataTextureControllerBufferType.Uint16Array);
			const texture = this._dataTextureController.fromRenderTarget(renderer, exrCubeRenderTarget);
			this._setMapping(texture);
			this.setTexture(texture);
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
