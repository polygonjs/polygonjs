import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {CorePoint} from '../../geometry/Point';
import {CoreMath} from '../../math/_Module';
import {Vector3} from 'three/src/math/Vector3';

interface JitterSopParams extends DefaultOperationParams {
	amount: number;
	seed: number;
}

export class JitterSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: JitterSopParams = {
		amount: 1,
		seed: 1,
	};
	static type(): Readonly<'jitter'> {
		return 'jitter';
	}

	cook(input_contents: CoreGroup[], params: JitterSopParams) {
		const core_group = input_contents[0];

		const points = core_group.points();
		let point: CorePoint;

		for (let i = 0; i < points.length; i++) {
			point = points[i];
			// TODO: replace by a pseudo random
			const offset = new Vector3(
				2 * (CoreMath.rand_float(i * 75 + 764 + params.seed) - 0.5),
				2 * (CoreMath.rand_float(i * 5678 + 3653 + params.seed) - 0.5),
				2 * (CoreMath.rand_float(i * 657 + 48464 + params.seed) - 0.5)
			);
			offset.normalize();
			offset.multiplyScalar(params.amount * CoreMath.rand_float(i * 78 + 54 + params.seed));

			const new_position = point.position().clone().add(offset);
			point.set_position(new_position);
		}

		return core_group;
	}
}
