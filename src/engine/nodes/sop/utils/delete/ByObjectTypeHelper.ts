import {DeleteSopNode} from '../../Delete';
import {BaseCoreObject} from '../../../../../core/geometry/entities/object/BaseCoreObject';
import {ObjectType, objectTypeFromConstructor} from '../../../../../core/geometry/Constant';
import {CoreObjectType} from '../../../../../core/geometry/ObjectContent';

export const OBJECT_TYPES: ObjectType[] = [
	ObjectType.MESH,
	ObjectType.POINTS,
	ObjectType.LINE_SEGMENTS,
	ObjectType.GROUP,
];

export const OBJECT_TYPE_MENU_ENTRIES = OBJECT_TYPES.map((name, value) => ({name, value}));

export class ByObjectTypeHelper {
	constructor(private node: DeleteSopNode) {}

	eval_for_objects(coreObjects: BaseCoreObject<CoreObjectType>[]) {
		const objectType = OBJECT_TYPES[this.node.pv.objectType];

		for (let coreObject of coreObjects) {
			const object = coreObject.object();
			if (object) {
				if (objectTypeFromConstructor(object.constructor) == objectType) {
					this.node.entitySelectionHelper.select(coreObject);
				}
			}
		}
	}
}
