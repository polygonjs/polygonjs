import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {isInGroup} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {ObjectContent, CoreObjectType} from '../../../core/geometry/ObjectContent';

interface DeleteByNameSopParams extends DefaultOperationParams {
	group: string;
	invert: boolean;
}

export class DeleteByNameSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: DeleteByNameSopParams = {
		group: '',
		invert: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.DELETE_BY_NAME> {
		return SopType.DELETE_BY_NAME;
	}

	override cook(inputCoreGroups: CoreGroup[], params: DeleteByNameSopParams) {
		const coreGroup = inputCoreGroups[0];

		const coreObjects = coreGroup.allCoreObjects();
		const newObjects: ObjectContent<CoreObjectType>[] = [];
		for (const coreObject of coreObjects) {
			let _isNotGroup = !isInGroup(`${params.group}`, coreObject);
			if (params.invert) {
				_isNotGroup = !_isNotGroup;
			}
			if (_isNotGroup) {
				newObjects.push(coreObject.object());
			}
		}

		return this.createCoreGroupFromObjects(newObjects);
	}
}
