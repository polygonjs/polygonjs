/**
 * Creates a LineBasicMaterial, used to render lines
 *
 *
 */
import {LineBasicMaterial} from 'three';
import {PrimitiveMatNode} from './_Base';

import {
	AdvancedCommonController,
	AdvancedCommonControllers,
	AdvancedCommonParamConfig,
} from './utils/AdvancedCommonController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

interface LineBasicBuilderControllers extends AdvancedCommonControllers {}
class LineBasicMatParamsConfig extends AdvancedCommonParamConfig(NodeParamsConfig) {
	/** @param line color */
	color = ParamConfig.COLOR([1, 1, 1]);
	/** @param line width */
	lineWidth = ParamConfig.FLOAT(1, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new LineBasicMatParamsConfig();

export class LineBasicMatNode extends PrimitiveMatNode<LineBasicMaterial, LineBasicMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): 'lineBasic' {
		return 'lineBasic';
	}

	override createMaterial() {
		return new LineBasicMaterial({
			color: 0xffffff,
			linewidth: 1,
		});
	}
	readonly controllers: LineBasicBuilderControllers = {
		advancedCommon: new AdvancedCommonController(this),
	};
	protected override controllersList = Object.values(this.controllers);

	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this._material.color.copy(this.pv.color);
		this._material.linewidth = this.pv.lineWidth;
		this._material.needsUpdate = true;

		this.setMaterial(this._material);
	}
}
