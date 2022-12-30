/**
 * Creates a Mesh Physical Material
 *
 * @remarks
 * This material needs lights to be visible.
 *
 */
import {MeshPhysicalMaterial} from 'three';
import {FrontSide} from 'three';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureEnvMapController, EnvMapParamConfig} from './utils/TextureEnvMapController';
import {TextureBumpMapController, BumpMapParamConfig} from './utils/TextureBumpMapController';
import {TextureNormalMapController, NormalMapParamConfig} from './utils/TextureNormalMapController';
import {TextureEmissiveMapController, EmissiveMapParamConfig} from './utils/TextureEmissiveMapController';
import {
	TextureMetalnessRoughnessMapController,
	MetalnessRoughnessMapParamConfig,
} from './utils/TextureMetalnessRoughnessMapController';
import {MeshPhysicalController, MeshPhysicalParamConfig} from './utils/MeshPhysicalController';
import {TextureLightMapController, LightMapParamConfig} from './utils/TextureLightMapController';
import {TextureDisplacementMapController, DisplacementMapParamConfig} from './utils/TextureDisplacementMapController';
import {TextureAOMapController, AOMapParamConfig} from './utils/TextureAOMapController';
import {WireframeController, WireframeParamConfig} from './utils/WireframeController';
import {FogController, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';

interface MeshPhysicalControllers {
	colors: ColorsController;
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	aoMap: TextureAOMapController;
	bumpMap: TextureBumpMapController;
	displacementMap: TextureDisplacementMapController;
	emissiveMap: TextureEmissiveMapController;
	envMap: TextureEnvMapController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
	metalnessRoughnessMap: TextureMetalnessRoughnessMapController;
	normalMap: TextureNormalMapController;
	physical: MeshPhysicalController;
}
class MeshPhysicalMatParamsConfig extends FogParamConfig(
	WireframeParamConfig(
		AdvancedCommonParamConfig(
			/* advanced */
			AdvancedFolderParamConfig(
				MeshPhysicalParamConfig(
					MetalnessRoughnessMapParamConfig(
						NormalMapParamConfig(
							LightMapParamConfig(
								EnvMapParamConfig(
									EmissiveMapParamConfig(
										DisplacementMapParamConfig(
											BumpMapParamConfig(
												AOMapParamConfig(
													AlphaMapParamConfig(
														MapParamConfig(
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
) {}
const ParamsConfig = new MeshPhysicalMatParamsConfig();

export class MeshPhysicalMatNode extends TypedMatNode<MeshPhysicalMaterial, MeshPhysicalMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshPhysical';
	}

	override createMaterial() {
		return new MeshPhysicalMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
			metalness: 1,
			roughness: 0,
		});
	}

	readonly controllers: MeshPhysicalControllers = {
		colors: new ColorsController(this),
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		emissiveMap: new TextureEmissiveMapController(this),
		envMap: new TextureEnvMapController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
		metalnessRoughnessMap: new TextureMetalnessRoughnessMapController(this),
		normalMap: new TextureNormalMapController(this),
		physical: new MeshPhysicalController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshPhysicalControllers>;
	override initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}

	override async cook() {
		this._material = this._material || this.createMaterial();
		for (let controllerName of this.controllerNames) {
			this.controllers[controllerName].update();
		}
		FogController.update(this);
		WireframeController.update(this);

		this.setMaterial(this._material);
	}
}
