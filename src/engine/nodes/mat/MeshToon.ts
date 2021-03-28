/**
 * Creates a Mesh Toon Material
 *
 * @remarks
 * This material needs lights to be visible. While not as photorealistic as the MeshStandardMaterial, it is very cheap to process.
 *
 */
import {MeshToonMaterial} from 'three/src/materials/MeshToonMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureBumpMapController, BumpMapParamConfig} from './utils/TextureBumpMapController';
import {TextureEmissiveMapController, EmissiveMapParamConfig} from './utils/TextureEmissiveMapController';
import {TextureGradientMapController, GradientMapParamConfig} from './utils/TextureGradientMapController';
import {TextureNormalMapController, NormalMapParamConfig} from './utils/TextureNormalMapController';
import {TextureDisplacementMapController, DisplacementMapParamConfig} from './utils/TextureDisplacementMapController';
import {TextureLightMapController, LightMapParamConfig} from './utils/TextureLightMapController';
import {TextureAOMapController, AOMapParamConfig} from './utils/TextureAOMapController';

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
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	aoMap: TextureAOMapController;
	bumpMap: TextureBumpMapController;
	displacementMap: TextureDisplacementMapController;
	emissiveMap: TextureEmissiveMapController;
	gradientMap: TextureGradientMapController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
	normalMap: TextureNormalMapController;
}
class MeshToonMatParamsConfig extends FogParamConfig(
	SkinningParamConfig(
		WireframeParamConfig(
			AdvancedCommonParamConfig(
				/* advanced */
				AdvancedFolderParamConfig(
					NormalMapParamConfig(
						LightMapParamConfig(
							GradientMapParamConfig(
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
const ParamsConfig = new MeshToonMatParamsConfig();

export class MeshToonMatNode extends TypedMatNode<MeshToonMaterial, MeshToonMatParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'meshToon';
	}

	createMaterial() {
		return new MeshToonMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: Controllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this, CONTROLLER_OPTIONS),
		aoMap: new TextureAOMapController(this, CONTROLLER_OPTIONS),
		bumpMap: new TextureBumpMapController(this, CONTROLLER_OPTIONS),
		displacementMap: new TextureDisplacementMapController(this, CONTROLLER_OPTIONS),
		emissiveMap: new TextureEmissiveMapController(this, CONTROLLER_OPTIONS),
		gradientMap: new TextureGradientMapController(this, CONTROLLER_OPTIONS),
		lightMap: new TextureLightMapController(this, CONTROLLER_OPTIONS),
		map: new TextureMapController(this, CONTROLLER_OPTIONS),
		normalMap: new TextureNormalMapController(this, CONTROLLER_OPTIONS),
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
		SkinningController.update(this);
		WireframeController.update(this);

		if (this.material.flatShading != isBooleanTrue(this.pv.flatShading)) {
			this.material.flatShading = isBooleanTrue(this.pv.flatShading);
			this.material.needsUpdate = true;
		}
		this.setMaterial(this.material);
	}
}
