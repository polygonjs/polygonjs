/**
 * Creates a Mesh Phong Material
 *
 * @remarks
 * This material needs lights to be visible. While not as photorealistic as the MeshStandardMaterial, it is very cheap to process.
 *
 */
import {MeshPhongMaterial} from 'three';
import {FrontSide} from 'three';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureBumpMapController, BumpMapParamConfig} from './utils/TextureBumpMapController';
import {TextureNormalMapController, NormalMapParamConfig} from './utils/TextureNormalMapController';
import {TextureSpecularMapController, SpecularMapParamConfig} from './utils/TextureSpecularMapController';
import {TextureEnvMapSimpleController, EnvMapSimpleParamConfig} from './utils/TextureEnvMapSimpleController';
import {TextureEmissiveMapController, EmissiveMapParamConfig} from './utils/TextureEmissiveMapController';
import {TextureDisplacementMapController, DisplacementMapParamConfig} from './utils/TextureDisplacementMapController';
import {TextureLightMapController, LightMapParamConfig} from './utils/TextureLightMapController';
import {TextureAOMapController, AOMapParamConfig} from './utils/TextureAOMapController';

import {WireframeController, WireframeParamConfig} from './utils/WireframeController';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {FogController, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
interface MeshPhongControllers {
	colors: ColorsController;
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	aoMap: TextureAOMapController;
	bumpMap: TextureBumpMapController;
	displacementMap: TextureDisplacementMapController;
	emissiveMap: TextureEmissiveMapController;
	envMap: TextureEnvMapSimpleController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
	normalMap: TextureNormalMapController;
	specularMap: TextureSpecularMapController;
}
class MeshPhongMatParamsConfig extends FogParamConfig(
	WireframeParamConfig(
		AdvancedCommonParamConfig(
			/* advanced */
			AdvancedFolderParamConfig(
				SpecularMapParamConfig(
					NormalMapParamConfig(
						LightMapParamConfig(
							EnvMapSimpleParamConfig(
								EmissiveMapParamConfig(
									DisplacementMapParamConfig(
										BumpMapParamConfig(
											AOMapParamConfig(
												AlphaMapParamConfig(
													MapParamConfig(
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
		)
	)
) {
	flatShading = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new MeshPhongMatParamsConfig();

export class MeshPhongMatNode extends TypedMatNode<MeshPhongMaterial, MeshPhongMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshPhong';
	}

	override createMaterial() {
		return new MeshPhongMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: MeshPhongControllers = {
		colors: new ColorsController(this),
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		emissiveMap: new TextureEmissiveMapController(this),
		envMap: new TextureEnvMapSimpleController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
		normalMap: new TextureNormalMapController(this),
		specularMap: new TextureSpecularMapController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshPhongControllers>;

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

		if (this._material.flatShading != isBooleanTrue(this.pv.flatShading)) {
			this._material.flatShading = isBooleanTrue(this.pv.flatShading);
			this._material.needsUpdate = true;
		}
		this.setMaterial(this._material);
	}
}
