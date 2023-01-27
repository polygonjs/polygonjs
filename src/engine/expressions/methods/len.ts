/**
 * returns the number of elements in an array or characters in a string
 *
 * @remarks
 * It takes 1 arguments.
 *
 * `len(array_or_word)`
 *
 * - `array_or_word` - array or word to returns the number of elements of
 *
 * ## Usage
 *
 * - `len('ab')` - returns 2
 *
 */
import {CoreType} from './../../../core/Type';
import {BaseMethod} from './_Base';

export class LenExpression extends BaseMethod {
	static override requiredArguments() {
		return [['array_or_string', 'array or string to count elements of']];
	}

	override async processArguments(args: any[]): Promise<number> {
		let value = 0;
		if (args.length == 1) {
			const arg = args[0];
			if (CoreType.isString(arg) || CoreType.isArray(arg)) {
				value = arg.length;
			}
		}
		return value;
	}
}
