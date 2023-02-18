/**
 * Creates a Shadow Material
 *
 *
 */
import {ShadowMaterial} from 'three';
import {FrontSide} from 'three';
import {PrimitiveMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig, ColorsControllers} from './utils/ColorsController';
import {
	AdvancedCommonController,
	AdvancedCommonControllers,
	AdvancedCommonParamConfig,
} from './utils/AdvancedCommonController';
import {MatType} from '../../poly/registers/nodes/types/Mat';

interface ShadowControllers extends AdvancedCommonControllers, ColorsControllers {}

class ShadowMatParamsConfig extends AdvancedCommonParamConfig(ColorParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new ShadowMatParamsConfig();

export class ShadowMatNode extends PrimitiveMatNode<ShadowMaterial, ShadowMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return MatType.SHADOW;
	}

	override createMaterial() {
		return new ShadowMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: ShadowControllers = {
		colors: new ColorsController(this),
		advancedCommon: new AdvancedCommonController(this),
	};
	protected override controllersList = Object.values(this.controllers);
	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
