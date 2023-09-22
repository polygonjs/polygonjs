/**
 * Creates a Mesh Toon Material
 *
 * @remarks
 * This material needs lights to be visible. While not as photorealistic as the MeshStandardMaterial, it is very cheap to process.
 *
 */
import {MeshToonMaterial} from 'three';
import {FrontSide} from 'three';
import {PrimitiveMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig, ColorsControllers} from './utils/ColorsController';
import {
	AdvancedCommonController,
	AdvancedCommonControllers,
	AdvancedCommonParamConfig,
} from './utils/AdvancedCommonController';
import {TextureMapController, MapParamConfig, TextureMapControllers} from './utils/TextureMapController';
import {
	TextureAlphaMapController,
	AlphaMapParamConfig,
	TextureAlphaMapControllers,
} from './utils/TextureAlphaMapController';
import {
	TextureBumpMapController,
	BumpMapParamConfig,
	TextureBumpMapControllers,
} from './utils/TextureBumpMapController';
import {
	TextureEmissiveMapController,
	EmissiveMapParamConfig,
	TextureEmissiveMapControllers,
} from './utils/TextureEmissiveMapController';
import {
	TextureGradientMapController,
	GradientMapParamConfig,
	TextureGradientMapControllers,
} from './utils/TextureGradientMapController';
import {
	TextureNormalMapController,
	NormalMapParamConfig,
	TextureNormalMapControllers,
} from './utils/TextureNormalMapController';
import {
	TextureDisplacementMapController,
	DisplacementMapParamConfig,
	TextureDisplacementMapControllers,
} from './utils/TextureDisplacementMapController';
import {
	TextureLightMapController,
	LightMapParamConfig,
	TextureLightMapControllers,
} from './utils/TextureLightMapController';
import {TextureAOMapController, AOMapParamConfig, TextureAOMapControllers} from './utils/TextureAOMapController';
import {WireframeController, WireframeControllers, WireframeParamConfig} from './utils/WireframeController';
import {FogController, FogControllers, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {MatType} from '../../poly/registers/nodes/types/Mat';
interface MeshToonControllers
	extends AdvancedCommonControllers,
		ColorsControllers,
		FogControllers,
		TextureAlphaMapControllers,
		TextureAOMapControllers,
		TextureBumpMapControllers,
		TextureDisplacementMapControllers,
		TextureEmissiveMapControllers,
		TextureGradientMapControllers,
		TextureLightMapControllers,
		TextureMapControllers,
		TextureNormalMapControllers,
		WireframeControllers {}
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

export class MeshToonMatNode extends PrimitiveMatNode<MeshToonMaterial, MeshToonMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): MatType.MESH_TOON {
		return MatType.MESH_TOON;
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
		colors: new ColorsController(this),
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		emissiveMap: new TextureEmissiveMapController(this),
		fog: new FogController(this),
		gradientMap: new TextureGradientMapController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
		normalMap: new TextureNormalMapController(this),
		wireframe: new WireframeController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshToonControllers>;

	override initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (const controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}
	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
