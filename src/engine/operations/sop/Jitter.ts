import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {jitterPositions} from '../../../core/geometry/operation/Jitter';

interface JitterSopParams extends DefaultOperationParams {
	amount: number;
	mult: Vector3;
	seed: number;
}

export class JitterSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: JitterSopParams = {
		amount: 1,
		mult: new Vector3(1, 1, 1),
		seed: 1,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'jitter'> {
		return 'jitter';
	}

	override cook(inputCoreGroups: CoreGroup[], params: JitterSopParams) {
		const coreGroup = inputCoreGroups[0];
		jitterPositions(coreGroup, params);

		return coreGroup;
	}
}
