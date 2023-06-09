import {Constructor} from '../../../../types/GlobalTypes';
import {BaseObjNodeType} from '../_Base';

const PARAM_NAME = 'layer';

import {ParamConfig} from '../../utils/params/ParamsConfig';
export function LayerParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		layer = ParamConfig.INTEGER(0, {
			range: [0, 31],
			rangeLocked: [true, true],
		});
	};
}

export class LayersController {
	constructor(private node: BaseObjNodeType) {}

	update() {
		const object = this.node.object;
		object.layers.set(0);
		object.layers.enable(this.node.params.integer(PARAM_NAME));
	}
}
