/**
 * Creates a Mesh Basic Material
 *
 * @remarks
 * This material only emits a color and does not react to light. It is therefore the less resource intensive material.
 *
 */

import {MeshNormalMaterial} from 'three/src/materials/MeshNormalMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FogController, FogParamConfig} from './utils/FogController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {TextureBumpMapController, BumpMapParamConfig} from './utils/TextureBumpMapController';
import {TextureNormalMapController, NormalMapParamConfig} from './utils/TextureNormalMapController';
import {TextureDisplacementMapController, DisplacementMapParamConfig} from './utils/TextureDisplacementMapController';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {UpdateOptions} from './utils/_BaseTextureController';
const CONTROLLER_OPTIONS: UpdateOptions = {
	directParams: true,
};
interface Controllers {
	bumpMap: TextureBumpMapController;
	displacementMap: TextureDisplacementMapController;
	normalMap: TextureNormalMapController;
	advancedCommon: AdvancedCommonController;
}
class MeshNormalMatParamsConfig extends FogParamConfig(
	AdvancedCommonParamConfig(
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

export class MeshNormalMatNode extends TypedMatNode<MeshNormalMaterial, MeshNormalMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshNormal';
	}

	override createMaterial() {
		return new MeshNormalMaterial({
			vertexColors: false,
			side: FrontSide,
			opacity: 1,
		}) as MeshNormalMaterial;
	}

	readonly controllers: Controllers = {
		advancedCommon: new AdvancedCommonController(this),
		bumpMap: new TextureBumpMapController(this, CONTROLLER_OPTIONS),
		displacementMap: new TextureDisplacementMapController(this, CONTROLLER_OPTIONS),
		normalMap: new TextureNormalMapController(this, CONTROLLER_OPTIONS),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof Controllers>;

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
		FogController.update(this);

		this.setMaterial(this.material);
	}
}
