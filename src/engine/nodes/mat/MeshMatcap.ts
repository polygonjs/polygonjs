/**
 * Creates a Mesh Standard Material
 *
 * @remarks
 * This material needs lights to be visible.
 *
 */
import {MeshMatcapMaterial} from 'three';
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
	TextureDisplacementMapController,
	DisplacementMapParamConfig,
	TextureDisplacementMapControllers,
} from './utils/TextureDisplacementMapController';
import {
	TextureMatcapMapController,
	MatcapMapParamConfig,
	TextureMatcapMapControllers,
} from './utils/TextureMatcapMapController';
import {FlatShadingController, FlatShadingParamConfig, FlatShadingControllers} from './utils/FlatShadingController';
import {FogController, FogParamConfig, FogControllers} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
interface MeshMatCapControllers
	extends AdvancedCommonControllers,
		ColorsControllers,
		FogControllers,
		FlatShadingControllers,
		TextureAlphaMapControllers,
		TextureBumpMapControllers,
		TextureDisplacementMapControllers,
		TextureMapControllers,
		TextureMatcapMapControllers,
		TextureNormalMapControllers {}

class MeshMatCapMatParamsConfig extends FogParamConfig(
	AdvancedCommonParamConfig(
		FlatShadingParamConfig(
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
	)
) {}
const ParamsConfig = new MeshMatCapMatParamsConfig();

export class MeshMatcapMatNode extends PrimitiveMatNode<MeshMatcapMaterial, MeshMatCapMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): 'meshMatcap' {
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
		colors: new ColorsController(this),
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		fog: new FogController(this),
		flatShading: new FlatShadingController(this),
		map: new TextureMapController(this),
		matcap: new TextureMatcapMapController(this),
		normalMap: new TextureNormalMapController(this),
	};
	protected override controllersList = Object.values(this.controllers);

	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
