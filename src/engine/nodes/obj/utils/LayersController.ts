import {BaseObjNode} from 'src/engine/nodes/obj/_Base';

const PARAM_NAME = 'layer';

export class LayersController {
	constructor(private node: BaseObjNode) {}

	add_params() {
		this.node.add_param(ParamType.INTEGER, PARAM_NAME, 0, {
			range: [0, 31],
			range_locked: [true, true],
		});
	}

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
