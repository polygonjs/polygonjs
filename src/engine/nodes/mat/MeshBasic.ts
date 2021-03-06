/**
 * Creates a Mesh Basic Material
 *
 * @remarks
 * This material only emits a color and does not react to light. It is therefore the less resource intensive material.
 *
 */

import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {Texture} from 'three/src/textures/Texture';
interface MeshBasicMaterialWithLightMap extends MeshBasicMaterial {
	lightMap: Texture | null;
	lightMapIntensity: number;
}

import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {FogController, FogParamConfig} from './utils/FogController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureAOMapController, AOMapParamConfig} from './utils/TextureAOMapController';
import {TextureEnvMapController, EnvMapParamConfig} from './utils/TextureEnvMapSimpleController';
import {TextureLightMapController, LightMapParamConfig} from './utils/TextureLightMapController';
import {WireframeController, WireframeParamConfig} from './utils/WireframeController';
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
	envMap: TextureEnvMapController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
}
class MeshBasicMatParamsConfig extends FogParamConfig(
	SkinningParamConfig(
		WireframeParamConfig(
			AdvancedCommonParamConfig(
				/* advanced */
				AdvancedFolderParamConfig(
					LightMapParamConfig(
						EnvMapParamConfig(
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
) {}
const ParamsConfig = new MeshBasicMatParamsConfig();

export class MeshBasicMatNode extends TypedMatNode<MeshBasicMaterialWithLightMap, MeshBasicMatParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'meshBasic';
	}

	createMaterial() {
		return new MeshBasicMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		}) as MeshBasicMaterialWithLightMap;
	}

	readonly controllers: Controllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this, CONTROLLER_OPTIONS),
		aoMap: new TextureAOMapController(this, CONTROLLER_OPTIONS),
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
		SkinningController.update(this);
		WireframeController.update(this);

		this.setMaterial(this.material);
	}
}
