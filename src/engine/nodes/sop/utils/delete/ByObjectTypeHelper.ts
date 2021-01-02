import {DeleteSopNode} from '../../Delete';
import {CoreObject} from '../../../../../core/geometry/Object';
import {ObjectTypes, objectTypeFromConstructor} from '../../../../../core/geometry/Constant';

export class ByObjectTypeHelper {
	constructor(private node: DeleteSopNode) {}

	eval_for_objects(core_objects: CoreObject[]) {
		const object_type = ObjectTypes[this.node.pv.objectType];

		for (let core_object of core_objects) {
			const object = core_object.object();

			if (objectTypeFromConstructor(object.constructor) == object_type) {
				this.node.entity_selection_helper.select(core_object);
			}
		}
	}
}
