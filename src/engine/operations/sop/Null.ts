import {BaseSopOperation} from './_Base';
import {ConvertExportParamDataParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface NullSopParams extends DefaultOperationParams {}

export class NullSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: NullSopParams = {};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'null'> {
		return 'null';
	}

	override cook(input_contents: CoreGroup[], params: NullSopParams) {
		const core_group = input_contents[0];
		if (core_group) {
			return core_group;
		} else {
			return this.createCoreGroupFromObjects([]);
		}
	}

	override convertExportParamData(options: ConvertExportParamDataParams) {}
}
