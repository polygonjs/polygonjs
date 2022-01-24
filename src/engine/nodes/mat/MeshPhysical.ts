/**
 * Creates a Mesh Physical Material
 *
 * @remarks
 * This material needs lights to be visible.
 *
 */
import {MeshPhysicalMaterial} from 'three/src/materials/MeshPhysicalMaterial';
import {FrontSide} from 'three/src/constants';
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
import {UpdateOptions} from './utils/_BaseTextureController';
const CONTROLLER_OPTIONS: UpdateOptions = {
	directParams: true,
};
interface Controllers {
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

	readonly controllers: Controllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this, CONTROLLER_OPTIONS),
		aoMap: new TextureAOMapController(this, CONTROLLER_OPTIONS),
		bumpMap: new TextureBumpMapController(this, CONTROLLER_OPTIONS),
		displacementMap: new TextureDisplacementMapController(this, CONTROLLER_OPTIONS),
		emissiveMap: new TextureEmissiveMapController(this, CONTROLLER_OPTIONS),
		envMap: new TextureEnvMapController(this, CONTROLLER_OPTIONS),
		lightMap: new TextureLightMapController(this, CONTROLLER_OPTIONS),
		map: new TextureMapController(this, CONTROLLER_OPTIONS),
		metalnessRoughnessMap: new TextureMetalnessRoughnessMapController(this, CONTROLLER_OPTIONS),
		normalMap: new TextureNormalMapController(this, CONTROLLER_OPTIONS),
		physical: new MeshPhysicalController(this, CONTROLLER_OPTIONS),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof Controllers>;
	override initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}

	override async cook() {
		for (let controllerName of this.controllerNames) {
			this.controllers[controllerName].update();
		}
		ColorsController.update(this);
		FogController.update(this);
		WireframeController.update(this);

		this.setMaterial(this.material);
	}
}
