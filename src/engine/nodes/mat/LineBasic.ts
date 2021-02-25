/**
 * Creates a LineBasicMaterial, used to render lines
 *
 *
 */
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {TypedMatNode} from './_Base';

import {DepthController, DepthParamConfig} from './utils/DepthController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

interface Controllers {
	depth: DepthController;
}
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
	readonly controllers: Controllers = {
		depth: new DepthController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof Controllers>;
	initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}
	async cook() {
		for (let controllerName of this.controllerNames) {
			this.controllers[controllerName].update();
		}

		this.material.color.copy(this.pv.color);
		this.material.linewidth = this.pv.lineWidth;

		this.setMaterial(this.material);
	}
}
