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
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureAOMapController, AOMapParamConfig} from './utils/TextureAOMapController';
import {TextureEnvMapSimpleController, EnvMapSimpleParamConfig} from './utils/TextureEnvMapSimpleController';
import {TextureLightMapController, LightMapParamConfig} from './utils/TextureLightMapController';
import {WireframeController, WireframeParamConfig} from './utils/WireframeController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';

interface Controllers {
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	aoMap: TextureAOMapController;
	envMap: TextureEnvMapSimpleController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
}
class MeshBasicMatParamsConfig extends FogParamConfig(
	WireframeParamConfig(
		AdvancedCommonParamConfig(
			/* advanced */
			AdvancedFolderParamConfig(
				LightMapParamConfig(
					EnvMapSimpleParamConfig(
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
) {}
const ParamsConfig = new MeshBasicMatParamsConfig();

export class MeshBasicMatNode extends TypedMatNode<MeshBasicMaterialWithLightMap, MeshBasicMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshBasic';
	}

	override createMaterial() {
		return new MeshBasicMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		}) as MeshBasicMaterialWithLightMap;
	}

	readonly controllers: Controllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		envMap: new TextureEnvMapSimpleController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
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
