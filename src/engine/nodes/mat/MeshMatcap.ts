/**
 * Creates a Mesh Standard Material
 *
 * @remarks
 * This material needs lights to be visible.
 *
 */
import {MeshMatcapMaterial} from 'three';
import {FrontSide} from 'three';
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
interface MeshMatCapControllers {
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	bumpMap: TextureBumpMapController;
	displacementMap: TextureDisplacementMapController;
	map: TextureMapController;
	matcap: TextureMatcapMapController;
	normalMap: TextureNormalMapController;
}

class MeshMatCapMatParamsConfig extends FogParamConfig(
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
const ParamsConfig = new MeshMatCapMatParamsConfig();

export class MeshMatcapMatNode extends TypedMatNode<MeshMatcapMaterial, MeshMatCapMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshMatcap';
	}

	override createMaterial() {
		return new MeshMatcapMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}

	readonly controllers: MeshMatCapControllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		map: new TextureMapController(this),
		matcap: new TextureMatcapMapController(this),
		normalMap: new TextureNormalMapController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshMatCapControllers>;
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

		this.setMaterial(this.material);
	}
}
