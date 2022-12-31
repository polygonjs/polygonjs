/**
 * Creates a Mesh Lambert Material
 *
 * @remarks
 * This material needs lights to be visible. While not as photorealistic as the MeshStandardMaterial, it is very cheap to process.
 *
 */

import {MeshLambertMaterial} from 'three';
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
	TextureEnvMapSimpleController,
	EnvMapSimpleParamConfig,
	TextureEnvMapSimpleControllers,
} from './utils/TextureEnvMapSimpleController';
import {
	TextureLightMapController,
	LightMapParamConfig,
	TextureLightMapControllers,
} from './utils/TextureLightMapController';
import {
	TextureEmissiveMapController,
	EmissiveMapParamConfig,
	TextureEmissiveMapControllers,
} from './utils/TextureEmissiveMapController';
import {FlatShadingController, FlatShadingParamConfig, FlatShadingControllers} from './utils/FlatShadingController';
import {TextureAOMapController, AOMapParamConfig, TextureAOMapControllers} from './utils/TextureAOMapController';
import {WireframeController, WireframeControllers, WireframeParamConfig} from './utils/WireframeController';
import {FogController, FogControllers, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';

interface MeshLambertControllers
	extends AdvancedCommonControllers,
		ColorsControllers,
		FogControllers,
		FlatShadingControllers,
		TextureAlphaMapControllers,
		TextureAOMapControllers,
		TextureEmissiveMapControllers,
		TextureEnvMapSimpleControllers,
		TextureLightMapControllers,
		TextureMapControllers,
		WireframeControllers {}
class MeshLambertMatParamsConfig extends FogParamConfig(
	WireframeParamConfig(
		AdvancedCommonParamConfig(
			FlatShadingParamConfig(
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
	)
) {}
const ParamsConfig = new MeshLambertMatParamsConfig();

export class MeshLambertMatNode extends PrimitiveMatNode<MeshLambertMaterial, MeshLambertMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): 'meshLambert' {
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
		colors: new ColorsController(this),
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		emissiveMap: new TextureEmissiveMapController(this),
		envMap: new TextureEnvMapSimpleController(this),
		fog: new FogController(this),
		flatShading: new FlatShadingController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
		wireframe: new WireframeController(this),
	};
	protected override controllersList = Object.values(this.controllers);
	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
