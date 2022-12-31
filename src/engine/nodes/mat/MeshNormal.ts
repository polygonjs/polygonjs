/**
 * Creates a Mesh Basic Material
 *
 * @remarks
 * This material only emits a color and does not react to light. It is therefore the less resource intensive material.
 *
 */

import {MeshNormalMaterial} from 'three';
import {FrontSide} from 'three';
import {PrimitiveMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	AdvancedCommonController,
	AdvancedCommonControllers,
	AdvancedCommonParamConfig,
} from './utils/AdvancedCommonController';
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
import {FlatShadingController, FlatShadingParamConfig, FlatShadingControllers} from './utils/FlatShadingController';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';

interface MeshNormalControllers
	extends AdvancedCommonControllers,
		TextureBumpMapControllers,
		TextureDisplacementMapControllers,
		FlatShadingControllers,
		TextureNormalMapControllers {}
class MeshNormalMatParamsConfig extends AdvancedCommonParamConfig(
	FlatShadingParamConfig(
		/* advanced */
		NormalMapParamConfig(
			DisplacementMapParamConfig(
				BumpMapParamConfig(
					/* textures */
					TexturesFolderParamConfig(DefaultFolderParamConfig(NodeParamsConfig))
				)
			)
		)
	)
) {}
const ParamsConfig = new MeshNormalMatParamsConfig();

export class MeshNormalMatNode extends PrimitiveMatNode<MeshNormalMaterial, MeshNormalMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): 'meshNormal' {
		return 'meshNormal';
	}

	override createMaterial() {
		return new MeshNormalMaterial({
			vertexColors: false,
			side: FrontSide,
			opacity: 1,
		}) as MeshNormalMaterial;
	}

	readonly controllers: MeshNormalControllers = {
		advancedCommon: new AdvancedCommonController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		flatShading: new FlatShadingController(this),
		normalMap: new TextureNormalMapController(this),
	};
	protected override controllersList = Object.values(this.controllers);
	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
