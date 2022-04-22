/**
 * Creates a Mesh Lambert Material
 *
 * @remarks
 * This material needs lights to be visible. While not as photorealistic as the MeshStandardMaterial, it is very cheap to process.
 *
 */

import {MeshLambertMaterial} from 'three';
import {FrontSide} from 'three';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureEnvMapSimpleController, EnvMapSimpleParamConfig} from './utils/TextureEnvMapSimpleController';
import {TextureLightMapController, LightMapParamConfig} from './utils/TextureLightMapController';
import {TextureEmissiveMapController, EmissiveMapParamConfig} from './utils/TextureEmissiveMapController';
import {TextureAOMapController, AOMapParamConfig} from './utils/TextureAOMapController';
import {WireframeController, WireframeParamConfig} from './utils/WireframeController';
import {FogController, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';

interface MeshLambertControllers {
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	aoMap: TextureAOMapController;
	emissiveMap: TextureEmissiveMapController;
	envMap: TextureEnvMapSimpleController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
}
class MeshLambertMatParamsConfig extends FogParamConfig(
	WireframeParamConfig(
		AdvancedCommonParamConfig(
			/* advanced */
			AdvancedFolderParamConfig(
				LightMapParamConfig(
					EnvMapSimpleParamConfig(
						EmissiveMapParamConfig(
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
const ParamsConfig = new MeshLambertMatParamsConfig();

export class MeshLambertMatNode extends TypedMatNode<MeshLambertMaterial, MeshLambertMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshLambert';
	}

	override createMaterial() {
		return new MeshLambertMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: MeshLambertControllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		emissiveMap: new TextureEmissiveMapController(this),
		envMap: new TextureEnvMapSimpleController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshLambertControllers>;
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
