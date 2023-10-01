import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {ENTITY_CLASS_FACTORY} from '../../../core/geometry/CoreObjectFactory';
import {filterObjectsFromCoreGroup} from '../../../core/geometry/Mask';

interface AttribRenameSopParams extends DefaultOperationParams {
	group: string;
	class: number;
	oldName: string;
	newName: string;
}
const SPLIT_REGEX = /[ ,]+/g;
export class AttribRenameSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribRenameSopParams = {
		group: '',
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
		oldName: '',
		newName: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribRename'> {
		return 'attribRename';
	}
	override cook(inputCoreGroups: CoreGroup[], params: AttribRenameSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = filterObjectsFromCoreGroup(coreGroup, params);
		const attribClass = ATTRIBUTE_CLASSES[params.class];
		const factory = ENTITY_CLASS_FACTORY[attribClass];
		const newAttribNames = params.newName.split(SPLIT_REGEX);
		if (factory) {
			for (const object of objects) {
				const entityClass = factory(object);
				const oldAttribNames = entityClass.attributeNamesMatchingMask(object, params.oldName);
				const minCount = Math.min(oldAttribNames.length, newAttribNames.length);
				for (let i = 0; i < minCount; i++) {
					entityClass.renameAttribute(object, oldAttribNames[i], newAttribNames[i]);
				}
			}
		} else {
			const oldAttribNames = coreGroup.attributeNamesMatchingMask(params.oldName);
			const minCount = Math.min(oldAttribNames.length, newAttribNames.length);
			for (let i = 0; i < minCount; i++) {
				coreGroup.renameAttribute(oldAttribNames[i], newAttribNames[i]);
			}
		}
		return coreGroup;
	}
}
