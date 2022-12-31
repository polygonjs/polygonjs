/**
 * Creates a Mesh Distance Material
 *
 *
 */

import {MeshDistanceMaterial} from 'three';
import {FrontSide} from 'three';
import {PrimitiveMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	AdvancedCommonController,
	AdvancedCommonControllers,
	AdvancedCommonParamConfig,
} from './utils/AdvancedCommonController';

interface MeshDistanceControllers extends AdvancedCommonControllers {}
class MeshDistanceMatParamsConfig extends AdvancedCommonParamConfig(NodeParamsConfig) {}
const ParamsConfig = new MeshDistanceMatParamsConfig();

export class MeshDistanceMatNode extends PrimitiveMatNode<MeshDistanceMaterial, MeshDistanceMatParamsConfig> {
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
	protected override controllersList = Object.values(this.controllers);
	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
