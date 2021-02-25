/**
 * Creates a Mesh Lambert Material
 *
 * @remarks
 * This material needs lights to be visible. While not as photorealistic as the MeshStandardMaterial, it is very cheap to process.
 *
 */

import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {DepthController, DepthParamConfig} from './utils/DepthController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureEnvMapController, TextureEnvMapParamConfig} from './utils/TextureEnvMapSimpleController';
import {TextureLightMapController, TextureLightMapParamConfig} from './utils/TextureLightMapController';
import {TextureEmissiveMapController, TextureEmissiveMapParamConfig} from './utils/TextureEmissiveMapController';
import {TextureAOMapController, TextureAOMapParamConfig} from './utils/TextureAOMapController';
import {WireframeController, WireframeParamConfig} from './utils/WireframeController';
import {FogController, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';

const CONTROLLER_OPTIONS = {
	directParams: true,
};
interface Controllers {
	alphaMap: TextureAlphaMapController;
	aoMap: TextureAOMapController;
	depth: DepthController;
	emissiveMap: TextureEmissiveMapController;
	envMap: TextureEnvMapController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
}
class MeshLambertMatParamsConfig extends FogParamConfig(
	SkinningParamConfig(
		WireframeParamConfig(
			DepthParamConfig(
				SideParamConfig(
					/* advanced */
					AdvancedFolderParamConfig(
						TextureEnvMapParamConfig(
							TextureLightMapParamConfig(
								TextureAOMapParamConfig(
									TextureEmissiveMapParamConfig(
										TextureAlphaMapParamConfig(
											TextureMapParamConfig(
												/* textures */
												TexturesFolderParamConfig(
													ColorParamConfig(DefaultFolderParamConfig(NodeParamsConfig))
												)
											)
										)
									)
								)
							)
						)
					)
				)
			)
		)
	)
) {}
const ParamsConfig = new MeshLambertMatParamsConfig();

export class MeshLambertMatNode extends TypedMatNode<MeshLambertMaterial, MeshLambertMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'meshLambert';
	}

	createMaterial() {
		return new MeshLambertMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: Controllers = {
		alphaMap: new TextureAlphaMapController(this, CONTROLLER_OPTIONS),
		aoMap: new TextureAOMapController(this, CONTROLLER_OPTIONS),
		depth: new DepthController(this),
		emissiveMap: new TextureEmissiveMapController(this, CONTROLLER_OPTIONS),
		envMap: new TextureEnvMapController(this, CONTROLLER_OPTIONS),
		lightMap: new TextureLightMapController(this, CONTROLLER_OPTIONS),
		map: new TextureMapController(this, CONTROLLER_OPTIONS),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof Controllers>;
	initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}
	async cook() {
		for (let controllerName of this.controllerNames) {
			this.controllers[controllerName].update();
		}
		ColorsController.update(this);
		FogController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		WireframeController.update(this);

		this.setMaterial(this.material);
	}
}
