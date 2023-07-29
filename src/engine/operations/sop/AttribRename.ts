import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';

interface AttribRenameSopParams extends DefaultOperationParams {
	class: number;
	oldName: string;
	newName: string;
}
const SPLIT_REGEX = /[ ,]+/g;
export class AttribRenameSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribRenameSopParams = {
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
		oldName: '',
		newName: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribRename'> {
		return 'attribRename';
	}
	override cook(inputCoreGroups: CoreGroup[], params: AttribRenameSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const oldNames = params.oldName.split(SPLIT_REGEX);
		const newNames = params.newName.split(SPLIT_REGEX);
		const minCount = Math.min(oldNames.length, newNames.length);
		const attribClass = ATTRIBUTE_CLASSES[params.class];
		for (let i = 0; i < minCount; i++) {
			inputCoreGroup.renameAttrib(oldNames[i], newNames[i], attribClass);
		}
		return inputCoreGroup;
	}
}
