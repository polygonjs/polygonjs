/**
 * Creates a Mesh Distance Material
 *
 *
 */

import {MeshDistanceMaterial} from 'three';
import {FrontSide} from 'three';
import {TypedMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';

interface MeshDistanceControllers {
	advancedCommon: AdvancedCommonController;
}
class MeshDistanceMatParamsConfig extends AdvancedCommonParamConfig(NodeParamsConfig) {}
const ParamsConfig = new MeshDistanceMatParamsConfig();

export class MeshDistanceMatNode extends TypedMatNode<MeshDistanceMaterial, MeshDistanceMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshDistance';
	}

	override createMaterial() {
		return new MeshDistanceMaterial({
			side: FrontSide,
		});
	}
	readonly controllers: MeshDistanceControllers = {
		advancedCommon: new AdvancedCommonController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshDistanceControllers>;
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
