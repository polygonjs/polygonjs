import {BaseSopOperation} from './_Base';
import {AxesHelper} from 'three';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {Vector3} from 'three';

interface AxesHelperSopParams extends DefaultOperationParams {
	center: Vector3;
}

export class AxesHelperSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AxesHelperSopParams = {
		center: new Vector3(0, 0, 0),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'axesHelper'> {
		return 'axesHelper';
	}

	override cook(input_contents: CoreGroup[], params: AxesHelperSopParams) {
		const helper = new AxesHelper();
		helper.geometry.translate(params.center.x, params.center.y, params.center.z);
		helper.matrixAutoUpdate = false;
		if (this._node) {
			helper.name = this._node.name();
		}
		return this.createCoreGroupFromObjects([helper]);
	}
}
