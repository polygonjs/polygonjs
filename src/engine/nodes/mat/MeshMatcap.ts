/**
 * Creates a Mesh Standard Material
 *
 * @remarks
 * This material needs lights to be visible.
 *
 */
import {MeshMatcapMaterial} from 'three/src/materials/MeshMatcapMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureBumpMapController, BumpMapParamConfig} from './utils/TextureBumpMapController';
import {TextureNormalMapController, NormalMapParamConfig} from './utils/TextureNormalMapController';
import {TextureDisplacementMapController, DisplacementMapParamConfig} from './utils/TextureDisplacementMapController';
import {TextureMatcapMapController, MatcapMapParamConfig} from './utils/TextureMatcapMapController';
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
	bumpMap: TextureBumpMapController;
	displacementMap: TextureDisplacementMapController;
	map: TextureMapController;
	matcap: TextureMatcapMapController;
	normalMap: TextureNormalMapController;
}

class MeshStandardMatParamsConfig extends FogParamConfig(
	AdvancedCommonParamConfig(
		/* advanced */
		AdvancedFolderParamConfig(
			NormalMapParamConfig(
				DisplacementMapParamConfig(
					BumpMapParamConfig(
						AlphaMapParamConfig(
							MapParamConfig(
								MatcapMapParamConfig(
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
const ParamsConfig = new MeshStandardMatParamsConfig();

export class MeshMatcapMatNode extends TypedMatNode<MeshMatcapMaterial, MeshStandardMatParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'meshMatcap';
	}

	createMaterial() {
		return new MeshMatcapMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}

	readonly controllers: Controllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this, CONTROLLER_OPTIONS),
		bumpMap: new TextureBumpMapController(this, CONTROLLER_OPTIONS),
		displacementMap: new TextureDisplacementMapController(this, CONTROLLER_OPTIONS),
		map: new TextureMapController(this, CONTROLLER_OPTIONS),
		matcap: new TextureMatcapMapController(this, CONTROLLER_OPTIONS),
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

		this.setMaterial(this.material);
	}
}
