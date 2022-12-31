/**
 * Creates a Mesh Depth Material
 *
 *
 */

import {MeshDepthMaterial} from 'three';
import {FrontSide} from 'three';
import {PrimitiveMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	AdvancedCommonController,
	AdvancedCommonParamConfig,
	AdvancedCommonControllers,
} from './utils/AdvancedCommonController';

interface MeshDepthControllers extends AdvancedCommonControllers {}
class MeshDepthMatParamsConfig extends AdvancedCommonParamConfig(NodeParamsConfig) {}
const ParamsConfig = new MeshDepthMatParamsConfig();

export class MeshDepthMatNode extends PrimitiveMatNode<MeshDepthMaterial, MeshDepthMatParamsConfig> {
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
	protected override controllersList = Object.values(this.controllers);
	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
