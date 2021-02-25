/**
 * Creates a Mesh Phong Material
 *
 * @remarks
 * This material needs lights to be visible. While not as photorealistic as the MeshStandardMaterial, it is very cheap to process.
 *
 */
import {MeshPhongMaterial} from 'three/src/materials/MeshPhongMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {DepthController, DepthParamConfig} from './utils/DepthController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureBumpMapController, TextureBumpMapParamConfig} from './utils/TextureBumpMapController';
import {TextureNormalMapController, TextureNormalMapParamConfig} from './utils/TextureNormalMapController';
import {TextureSpecularMapController, TextureSpecularMapParamConfig} from './utils/TextureSpecularMapController';
import {TextureEnvMapController, TextureEnvMapParamConfig} from './utils/TextureEnvMapSimpleController';
import {
	TextureDisplacementMapController,
	TextureDisplacementMapParamConfig,
} from './utils/TextureDisplacementMapController';
import {TextureLightMapController, TextureLightMapParamConfig} from './utils/TextureLightMapController';
import {TextureAOMapController, TextureAOMapParamConfig} from './utils/TextureAOMapController';

import {WireframeController, WireframeParamConfig} from './utils/WireframeController';
import {isBooleanTrue} from '../../../core/BooleanValue';
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
	bumpMap: TextureBumpMapController;
	depth: DepthController;
	displacementMap: TextureDisplacementMapController;
	envMap: TextureEnvMapController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
	normalMap: TextureNormalMapController;
	specularMap: TextureSpecularMapController;
}
class MeshPhongMatParamsConfig extends FogParamConfig(
	SkinningParamConfig(
		WireframeParamConfig(
			DepthParamConfig(
				SideParamConfig(
					/* advanced */
					AdvancedFolderParamConfig(
						TextureEnvMapParamConfig(
							TextureLightMapParamConfig(
								TextureDisplacementMapParamConfig(
									TextureNormalMapParamConfig(
										TextureBumpMapParamConfig(
											TextureAOMapParamConfig(
												TextureSpecularMapParamConfig(
													TextureAlphaMapParamConfig(
														TextureMapParamConfig(
															/* textures */
															TexturesFolderParamConfig(
																ColorParamConfig(
																	DefaultFolderParamConfig(NodeParamsConfig)
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
				)
			)
		)
	)
) {
	flatShading = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new MeshPhongMatParamsConfig();

export class MeshPhongMatNode extends TypedMatNode<MeshPhongMaterial, MeshPhongMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'meshPhong';
	}

	createMaterial() {
		return new MeshPhongMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: Controllers = {
		alphaMap: new TextureAlphaMapController(this, CONTROLLER_OPTIONS),
		aoMap: new TextureAOMapController(this, CONTROLLER_OPTIONS),
		bumpMap: new TextureBumpMapController(this, CONTROLLER_OPTIONS),
		depth: new DepthController(this),
		displacementMap: new TextureDisplacementMapController(this, CONTROLLER_OPTIONS),
		envMap: new TextureEnvMapController(this, CONTROLLER_OPTIONS),
		lightMap: new TextureLightMapController(this, CONTROLLER_OPTIONS),
		map: new TextureMapController(this, CONTROLLER_OPTIONS),
		normalMap: new TextureNormalMapController(this, CONTROLLER_OPTIONS),
		specularMap: new TextureSpecularMapController(this, CONTROLLER_OPTIONS),
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

		if (this.material.flatShading != isBooleanTrue(this.pv.flatShading)) {
			this.material.flatShading = isBooleanTrue(this.pv.flatShading);
			this.material.needsUpdate = true;
		}
		this.setMaterial(this.material);
	}
}
