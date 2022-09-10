/**
 * Creates a Mesh Basic Material
 *
 * @remarks
 * This material only emits a color and does not react to light. It is therefore the less resource intensive material.
 *
 */

import {MeshNormalMaterial} from 'three';
import {FrontSide} from 'three';
import {TypedMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {TextureBumpMapController, BumpMapParamConfig} from './utils/TextureBumpMapController';
import {TextureNormalMapController, NormalMapParamConfig} from './utils/TextureNormalMapController';
import {TextureDisplacementMapController, DisplacementMapParamConfig} from './utils/TextureDisplacementMapController';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';

interface MeshNormalControllers {
	bumpMap: TextureBumpMapController;
	displacementMap: TextureDisplacementMapController;
	normalMap: TextureNormalMapController;
	advancedCommon: AdvancedCommonController;
}
class MeshNormalMatParamsConfig extends AdvancedCommonParamConfig(
	/* advanced */
	NormalMapParamConfig(
		DisplacementMapParamConfig(
			BumpMapParamConfig(
				/* textures */
				TexturesFolderParamConfig(DefaultFolderParamConfig(NodeParamsConfig))
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

	readonly controllers: MeshNormalControllers = {
		advancedCommon: new AdvancedCommonController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		normalMap: new TextureNormalMapController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshNormalControllers>;

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

		this.setMaterial(this.material);
	}
}
