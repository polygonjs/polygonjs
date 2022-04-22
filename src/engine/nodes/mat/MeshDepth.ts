/**
 * Creates a Mesh Depth Material
 *
 *
 */

import {MeshDepthMaterial} from 'three';
import {FrontSide} from 'three';
import {TypedMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';

interface MeshDepthControllers {
	advancedCommon: AdvancedCommonController;
}
class MeshDepthMatParamsConfig extends AdvancedCommonParamConfig(NodeParamsConfig) {}
const ParamsConfig = new MeshDepthMatParamsConfig();

export class MeshDepthMatNode extends TypedMatNode<MeshDepthMaterial, MeshDepthMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshDepth';
	}

	override createMaterial() {
		return new MeshDepthMaterial({
			side: FrontSide,
		});
	}
	readonly controllers: MeshDepthControllers = {
		advancedCommon: new AdvancedCommonController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshDepthControllers>;
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
