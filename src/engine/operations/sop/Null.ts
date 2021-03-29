import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DefaultOperationParams} from '../_Base';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface NullSopParams extends DefaultOperationParams {}

export class NullSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: NullSopParams = {};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'null'> {
		return 'null';
	}

	cook(input_contents: CoreGroup[], params: NullSopParams) {
		const core_group = input_contents[0];
		if (core_group) {
			return core_group;
		} else {
			return this.createCoreGroupFromObjects([]);
		}
	}
}
