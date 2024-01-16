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
import {isString,isArray} from './../../../core/Type';
import {BaseMethod} from './_Base';

export class LenExpression extends BaseMethod {
	static override requiredArguments() {
		return [['array_or_string', 'array or string to count elements of']];
	}

	override async processArguments(args: any[]): Promise<number> {
		if (args.length == 1) {
			const arg = args[0];
			if (isString(arg) || isArray(arg)) {
				return arg.length;
			}
		}
		return 0;
	}
}
