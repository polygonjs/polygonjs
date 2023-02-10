import {DeleteSopNode} from '../../Delete';
import {CoreObject} from '../../../../../core/geometry/Object';
import {ObjectType, objectTypeFromConstructor} from '../../../../../core/geometry/Constant';

export const OBJECT_TYPES: ObjectType[] = [
	ObjectType.MESH,
	ObjectType.POINTS,
	ObjectType.LINE_SEGMENTS,
	ObjectType.GROUP,
];

export const OBJECT_TYPE_MENU_ENTRIES = OBJECT_TYPES.map((name, value) => ({name, value}));

export class ByObjectTypeHelper {
	constructor(private node: DeleteSopNode) {}

	eval_for_objects(core_objects: CoreObject[]) {
		const object_type = OBJECT_TYPES[this.node.pv.objectType];

		for (let core_object of core_objects) {
			const object = core_object.object();

			if (objectTypeFromConstructor(object.constructor) == object_type) {
				this.node.entitySelectionHelper.select(core_object);
			}
		}
	}
}
