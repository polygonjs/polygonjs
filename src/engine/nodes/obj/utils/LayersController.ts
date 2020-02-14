import {BaseObjNodeType} from 'src/engine/nodes/obj/_Base';
// import {ParamType} from 'src/engine/poly/ParamType';

const PARAM_NAME = 'layer';

import {ParamConfig} from '../../utils/params/ParamsConfig';
export function LayerParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		layer = ParamConfig.INTEGER(0, {
			range: [0, 31],
			range_locked: [true, true],
		});
	};
}

export class LayersController {
	constructor(private node: BaseObjNodeType) {}

	// add_params() {
	// 	this.node.add_param(ParamType.INTEGER, PARAM_NAME, 0, {
	// 		range: [0, 31],
	// 		range_locked: [true, true],
	// 	});
	// }

	update() {
		const object = this.node.object;
		// const affected_objects = [object];
		// if (object.cloned_cameras != null) {
		// 	lodash_each(object.cloned_cameras, cloned_camera=> {
		// 		affected_objects.push(cloned_camera);
		// 	});
		// }

		// affected_objects.forEach((affected_object)=> {
		object.layers.set(0);
		object.layers.enable(this.node.params.integer(PARAM_NAME));
		// });
	}
}
