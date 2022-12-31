/**
 * Creates a Mesh Standard Material
 *
 * @remarks
 * This material needs lights to be visible.
 *
 */
import {MeshStandardMaterial} from 'three';
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
import {TextureEnvMapController, EnvMapParamConfig, TextureEnvMapControllers} from './utils/TextureEnvMapController';
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
	TextureEmissiveMapController,
	EmissiveMapParamConfig,
	TextureEmissiveMapControllers,
} from './utils/TextureEmissiveMapController';
import {
	TextureMetalnessRoughnessMapController,
	MetalnessRoughnessMapParamConfig,
	TextureMetalnessRoughnessMapControllers,
} from './utils/TextureMetalnessRoughnessMapController';
import {
	TextureLightMapController,
	LightMapParamConfig,
	TextureLightMapControllers,
} from './utils/TextureLightMapController';
import {
	TextureDisplacementMapController,
	DisplacementMapParamConfig,
	TextureDisplacementMapControllers,
} from './utils/TextureDisplacementMapController';
import {TextureAOMapController, AOMapParamConfig, TextureAOMapControllers} from './utils/TextureAOMapController';
import {WireframeController, WireframeControllers, WireframeParamConfig} from './utils/WireframeController';
import {FogController, FogControllers, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';

interface MeshStandardControllers
	extends AdvancedCommonControllers,
		ColorsControllers,
		FogControllers,
		TextureAlphaMapControllers,
		TextureAOMapControllers,
		TextureBumpMapControllers,
		TextureDisplacementMapControllers,
		TextureEmissiveMapControllers,
		TextureEnvMapControllers,
		TextureLightMapControllers,
		TextureMapControllers,
		TextureMetalnessRoughnessMapControllers,
		TextureNormalMapControllers,
		WireframeControllers {}
class MeshStandardMatParamsConfig extends FogParamConfig(
	WireframeParamConfig(
		AdvancedCommonParamConfig(
			/* advanced */
			AdvancedFolderParamConfig(
				MetalnessRoughnessMapParamConfig(
					NormalMapParamConfig(
						LightMapParamConfig(
							EnvMapParamConfig(
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
) {}
const ParamsConfig = new MeshStandardMatParamsConfig();

export class MeshStandardMatNode extends PrimitiveMatNode<MeshStandardMaterial, MeshStandardMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshStandard';
	}

	override createMaterial() {
		return new MeshStandardMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
			metalness: 1,
			roughness: 0,
		});
	}

	readonly controllers: MeshStandardControllers = {
		colors: new ColorsController(this),
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		emissiveMap: new TextureEmissiveMapController(this),
		envMap: new TextureEnvMapController(this),
		fog: new FogController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
		metalnessRoughnessMap: new TextureMetalnessRoughnessMapController(this),
		normalMap: new TextureNormalMapController(this),
		wireframe: new WireframeController(this),
	};
	protected override controllersList = Object.values(this.controllers);

	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
