import {Vector3} from 'three';
import {CoreGroup} from '../Group';
import {randFloat} from '../../math/_Module';

interface JitterOptions {
	amount: number;
	mult: Vector3;
	seed: number;
}

const _offset = new Vector3();
const _p = new Vector3();
export function jitterPositions(coreGroup: CoreGroup, options: JitterOptions) {
	const {amount, mult, seed} = options;
	const points = coreGroup.points();

	let i = 0;
	for (const point of points) {
		_offset.set(
			2 * (randFloat(i * 75 + 764 + seed) - 0.5),
			2 * (randFloat(i * 5678 + 3653 + seed) - 0.5),
			2 * (randFloat(i * 657 + 48464 + seed) - 0.5)
		);
		_offset.normalize();
		_offset.multiply(mult);
		_offset.multiplyScalar(amount * randFloat(i * 78 + 54 + seed));

		point.getPosition(_p);
		_p.add(_offset);
		point.setPosition(_p);
		i++;
	}
}
