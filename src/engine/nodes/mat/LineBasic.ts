/**
 * Creates a LineBasicMaterial, used to render lines
 *
 *
 */
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {TypedMatNode} from './_Base';

import {DepthController, DepthParamConfig} from './utils/DepthController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class LineBasicMatParamsConfig extends DepthParamConfig(NodeParamsConfig) {
	/** @param line color */
	color = ParamConfig.COLOR([1, 1, 1]);
	/** @param line width */
	lineWidth = ParamConfig.FLOAT(1, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new LineBasicMatParamsConfig();

export class LineBasicMatNode extends TypedMatNode<LineBasicMaterial, LineBasicMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'lineBasic';
	}

	createMaterial() {
		return new LineBasicMaterial({
			color: 0xffffff,
			linewidth: 1,
		});
	}

	readonly depth_controller: DepthController = new DepthController(this);
	initializeNode() {}
	async cook() {
		this.material.color.copy(this.pv.color);
		this.material.linewidth = this.pv.lineWidth;
		this.depth_controller.update();

		this.set_material(this.material);
	}
}
