import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {ENTITY_CLASS_FACTORY} from '../../../core/geometry/CoreObjectFactory';
import {filterObjectsFromCoreGroup} from '../../../core/geometry/Mask';

interface AttribDeleteSopParams extends DefaultOperationParams {
	group: string;
	class: number;
	name: string;
}
export class AttribDeleteSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribDeleteSopParams = {
		group: '',
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
		name: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribDelete'> {
		return 'attribDelete';
	}
	override cook(inputCoreGroups: CoreGroup[], params: AttribDeleteSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = filterObjectsFromCoreGroup(coreGroup, params);
		const attribClass = ATTRIBUTE_CLASSES[params.class];
		const factory = ENTITY_CLASS_FACTORY[attribClass];
		if (factory) {
			for (const object of objects) {
				const entityClass = factory(object);
				const attribNames = entityClass.attributeNamesMatchingMask(object, params.name);
				for (const attribName of attribNames) {
					entityClass.deleteAttribute(object, attribName);
				}
			}
		} else {
			const attribNames = coreGroup.attributeNamesMatchingMask(params.name);
			for (const attribName of attribNames) {
				coreGroup.deleteAttribute(attribName);
			}
		}
		return coreGroup;
	}
}
