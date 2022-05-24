import {BaseSopOperation} from './_Base';
import {AxesHelper} from 'three';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface AxesHelperSopParams extends DefaultOperationParams {}

export class AxesHelperSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AxesHelperSopParams = {};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'axesHelper'> {
		return 'axesHelper';
	}

	override cook(input_contents: CoreGroup[], params: AxesHelperSopParams) {
		const helper = new AxesHelper();
		helper.matrixAutoUpdate = false;
		return this.createCoreGroupFromObjects([helper]);
	}
}
