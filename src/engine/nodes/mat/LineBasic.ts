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
	line_width = ParamConfig.FLOAT(1, {
		range: [1, 10],
		range_locked: [true, false],
	});
}
const ParamsConfig = new LineBasicMatParamsConfig();

export class LineBasicMatNode extends TypedMatNode<LineBasicMaterial, LineBasicMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'line_basic';
	}

	create_material() {
		return new LineBasicMaterial({
			color: 0xffffff,
			linewidth: 1,
		});
	}

	readonly depth_controller: DepthController = new DepthController(this);
	initialize_node() {}
	async cook() {
		this.material.color.copy(this.pv.color);
		this.material.linewidth = this.pv.line_width;
		this.depth_controller.update();

		this.set_material(this.material);
	}
}
