import {DeleteSopNode} from '../../Delete';
import {CoreObject} from '../../../../../core/geometry/Object';
import {ObjectTypes, object_type_from_constructor} from '../../../../../core/geometry/Constant';

export class ByObjectTypeHelper {
	constructor(private node: DeleteSopNode) {}

	eval_for_objects(core_objects: CoreObject[]) {
		const object_type = ObjectTypes[this.node.pv.object_type];

		for (let core_object of core_objects) {
			const object = core_object.object();

			if (object_type_from_constructor(object.constructor) == object_type) {
				this.node.entity_selection_helper.select(core_object);
			}
		}
	}
}
