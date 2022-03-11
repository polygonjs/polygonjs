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
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
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
import {FogController, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
interface MeshToonControllers {
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
) {}
const ParamsConfig = new MeshToonMatParamsConfig();

export class MeshToonMatNode extends TypedMatNode<MeshToonMaterial, MeshToonMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshToon';
	}

	override createMaterial() {
		return new MeshToonMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: MeshToonControllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		emissiveMap: new TextureEmissiveMapController(this),
		gradientMap: new TextureGradientMapController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
		normalMap: new TextureNormalMapController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshToonControllers>;

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
