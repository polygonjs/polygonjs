import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {AttribClass} from '../../../core/geometry/Constant';

interface AttribRenameSopParams extends DefaultOperationParams {
	class: number;
	oldName: string;
	newName: string;
}

export class AttribRenameSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribRenameSopParams = {
		class: AttribClass.VERTEX,
		oldName: '',
		newName: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribRename'> {
		return 'attribRename';
	}
	override cook(inputCoreGroups: CoreGroup[], params: AttribRenameSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		inputCoreGroup.renameAttrib(params.oldName, params.newName, params.class);
		return inputCoreGroup;
	}
}
