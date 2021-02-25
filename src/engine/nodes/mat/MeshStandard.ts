/**
 * Creates a Mesh Standard Material
 *
 * @remarks
 * This material needs lights to be visible.
 *
 */
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {DepthController, DepthParamConfig} from './utils/DepthController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureEnvMapController, TextureEnvMapParamConfig} from './utils/TextureEnvMapController';
import {TextureBumpMapController, TextureBumpMapParamConfig} from './utils/TextureBumpMapController';
import {TextureNormalMapController, TextureNormalMapParamConfig} from './utils/TextureNormalMapController';
import {TextureRoughnessMapController, TextureRoughnessMapParamConfig} from './utils/TextureRoughnessMapController';
import {TextureMetalnessMapController, TextureMetalnessMapParamConfig} from './utils/TextureMetalnessMapController';
import {TextureLightMapController, TextureLightMapParamConfig} from './utils/TextureLightMapController';
import {
	TextureDisplacementMapController,
	TextureDisplacementMapParamConfig,
} from './utils/TextureDisplacementMapController';
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
	bumpMap: TextureBumpMapController;
	depth: DepthController;
	displacementMap: TextureDisplacementMapController;
	envMap: TextureEnvMapController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
	metalnessMap: TextureMetalnessMapController;
	normalMap: TextureNormalMapController;
	roughnessMap: TextureRoughnessMapController;
}
class MeshStandardMatParamsConfig extends FogParamConfig(
	SkinningParamConfig(
		WireframeParamConfig(
			DepthParamConfig(
				SideParamConfig(
					/* advanced */
					AdvancedFolderParamConfig(
						TextureMetalnessMapParamConfig(
							TextureRoughnessMapParamConfig(
								TextureEnvMapParamConfig(
									TextureLightMapParamConfig(
										TextureNormalMapParamConfig(
											TextureBumpMapParamConfig(
												TextureDisplacementMapParamConfig(
													TextureAOMapParamConfig(
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
	)
) {}
// TODO: add the following texture params:
// - bumpMap+bumpScale
// - emissiveMap
// - lightMap
const ParamsConfig = new MeshStandardMatParamsConfig();

export class MeshStandardMatNode extends TypedMatNode<MeshStandardMaterial, MeshStandardMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'meshStandard';
	}

	createMaterial() {
		return new MeshStandardMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
			metalness: 1,
			roughness: 0,
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
		metalnessMap: new TextureMetalnessMapController(this, CONTROLLER_OPTIONS),
		normalMap: new TextureNormalMapController(this, CONTROLLER_OPTIONS),
		roughnessMap: new TextureRoughnessMapController(this, CONTROLLER_OPTIONS),
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
