import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreMath} from '../../../core/math/_Module';
import {Vector3} from 'three/src/math/Vector3';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

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

	override cook(input_contents: CoreGroup[], params: JitterSopParams) {
		const core_group = input_contents[0];

		const points = core_group.points();
		let point: CorePoint;

		for (let i = 0; i < points.length; i++) {
			point = points[i];
			// TODO: replace by a pseudo random
			const offset = new Vector3(
				2 * (CoreMath.randFloat(i * 75 + 764 + params.seed) - 0.5),
				2 * (CoreMath.randFloat(i * 5678 + 3653 + params.seed) - 0.5),
				2 * (CoreMath.randFloat(i * 657 + 48464 + params.seed) - 0.5)
			);
			offset.normalize();
			offset.multiply(params.mult);
			offset.multiplyScalar(params.amount * CoreMath.randFloat(i * 78 + 54 + params.seed));

			const new_position = point.position().clone().add(offset);
			point.setPosition(new_position);
		}

		return core_group;
	}
}
