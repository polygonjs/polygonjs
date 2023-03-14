/**
 * Returns a value between 0-1 that represents the percentage that x has moved between min and max, but smoothed or slowed down the closer X is to the min and max. see [https://en.wikipedia.org/wiki/Smoothstep](https://en.wikipedia.org/wiki/Smoothstep) for details.
 *
 * @remarks
 * It takes 3 arguments.
 *
 * `smoothstep(x, min, max)`
 *
 * - `x` - value to remap
 * - `min` - range min
 * - `max` - range max
 *
 * ## Usage
 *
 * - `smoothstep(2,3,2.5)` - returns 0.5
 *
 */
import {BaseMethod} from './_Base';
import {MathUtils} from 'three';

export class SmootherstepExpression extends BaseMethod {
	static override requiredArguments() {
		return [, ['x', 'value'], ['min', 'range min'], ['max', 'range max']];
	}

	override async processArguments(args: any[]): Promise<number> {
		let value = 0;
		if (args.length == 3) {
			const x = args[0];
			const rangeMin = args[1];
			const rangeMax = args[2];
			value = MathUtils.smootherstep(x, rangeMin, rangeMax);
		}
		return value;
	}
}
