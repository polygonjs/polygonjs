/**
 * Creates a Mesh Phong Material
 *
 * @remarks
 * This material needs lights to be visible. While not as photorealistic as the MeshStandardMaterial, it is very cheap to process.
 *
 */
import {MeshPhongMaterial} from 'three';
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
	TextureNormalMapController,
	NormalMapParamConfig,
	TextureNormalMapControllers,
} from './utils/TextureNormalMapController';
import {
	TextureSpecularMapController,
	SpecularMapParamConfig,
	TextureSpecularMapControllers,
} from './utils/TextureSpecularMapController';
import {
	TextureEnvMapSimpleController,
	EnvMapSimpleParamConfig,
	TextureEnvMapSimpleControllers,
} from './utils/TextureEnvMapSimpleController';
import {
	TextureEmissiveMapController,
	EmissiveMapParamConfig,
	TextureEmissiveMapControllers,
} from './utils/TextureEmissiveMapController';
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
import {FlatShadingController, FlatShadingParamConfig, FlatShadingControllers} from './utils/FlatShadingController';
import {WireframeController, WireframeControllers, WireframeParamConfig} from './utils/WireframeController';

import {FogController, FogControllers, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
interface MeshPhongControllers
	extends AdvancedCommonControllers,
		ColorsControllers,
		FogControllers,
		FlatShadingControllers,
		TextureAlphaMapControllers,
		TextureAOMapControllers,
		TextureBumpMapControllers,
		TextureDisplacementMapControllers,
		TextureEmissiveMapControllers,
		TextureEnvMapSimpleControllers,
		TextureLightMapControllers,
		TextureMapControllers,
		TextureNormalMapControllers,
		TextureSpecularMapControllers,
		WireframeControllers {}
class MeshPhongMatParamsConfig extends FogParamConfig(
	WireframeParamConfig(
		AdvancedCommonParamConfig(
			FlatShadingParamConfig(
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
const ParamsConfig = new MeshPhongMatParamsConfig();

export class MeshPhongMatNode extends PrimitiveMatNode<MeshPhongMaterial, MeshPhongMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): 'meshPhong' {
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
		fog: new FogController(this),
		flatShading: new FlatShadingController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
		normalMap: new TextureNormalMapController(this),
		specularMap: new TextureSpecularMapController(this),
		wireframe: new WireframeController(this),
	};
	protected override controllersList = Object.values(this.controllers);
	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
