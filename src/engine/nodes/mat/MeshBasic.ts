/**
 * Creates a Mesh Basic Material
 *
 * @remarks
 * This material only emits a color and does not react to light. It is therefore the less resource intensive material.
 *
 */

import {MeshBasicMaterial} from 'three';
import {Texture} from 'three';
interface MeshBasicMaterialWithLightMap extends MeshBasicMaterial {
	lightMap: Texture | null;
	lightMapIntensity: number;
}

import {FrontSide} from 'three';
import {PrimitiveMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig, ColorsControllers} from './utils/ColorsController';
import {FogController, FogParamConfig, FogControllers} from './utils/FogController';
import {
	AdvancedCommonController,
	AdvancedCommonParamConfig,
	AdvancedCommonControllers,
} from './utils/AdvancedCommonController';
import {TextureMapController, MapParamConfig, TextureMapControllers} from './utils/TextureMapController';
import {
	TextureAlphaMapController,
	AlphaMapParamConfig,
	TextureAlphaMapControllers,
} from './utils/TextureAlphaMapController';
import {TextureAOMapController, AOMapParamConfig, TextureAOMapControllers} from './utils/TextureAOMapController';
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
import {WireframeController, WireframeParamConfig, WireframeControllers} from './utils/WireframeController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {MatType} from '../../poly/registers/nodes/types/Mat';

interface MeshBasicControllers
	extends AdvancedCommonControllers,
		ColorsControllers,
		FogControllers,
		TextureAlphaMapControllers,
		TextureAOMapControllers,
		TextureEnvMapSimpleControllers,
		TextureLightMapControllers,
		TextureMapControllers,
		WireframeControllers {}
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

export class MeshBasicMatNode extends PrimitiveMatNode<MeshBasicMaterialWithLightMap, MeshBasicMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): MatType.MESH_BASIC {
		return MatType.MESH_BASIC;
	}

	override createMaterial() {
		return new MeshBasicMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		}) as MeshBasicMaterialWithLightMap;
	}

	readonly controllers: MeshBasicControllers = {
		colors: new ColorsController(this),
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		envMap: new TextureEnvMapSimpleController(this),
		fog: new FogController(this),
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
