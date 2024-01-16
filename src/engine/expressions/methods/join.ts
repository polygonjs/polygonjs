/**
 * returns the elements of an array joined by a separator string
 *
 * @remarks
 * It takes 1 or 2 arguments.
 *
 * `join(array_or_word, separator)`
 *
 * - `array_or_word` - array to join the elements of
 * - `separator` - string to join the elements (default is a space ' ')
 *
 * ## Usage
 *
 * - `join([1,2])` - returns '1 2'
 * - `join([1,2,3],',')` - returns '1,2,3'
 *
 */
import {isArray} from '../../../core/Type';
import {BaseMethod} from './_Base';

export class JoinExpression extends BaseMethod {
	static override requiredArguments() {
		return [
			['array', 'array to join the elements of'],
			['separator', 'separator used to join the elements'],
		];
	}

	override async processArguments(args: any[]): Promise<string> {
		if (args.length == 1 || args.length == 2) {
			const arg = args[0];
			let separator = args[1];
			if (separator == null) {
				separator = ' ';
			}
			if (isArray(arg)) {
				return arg.join(separator);
			}
		}
		return '';
	}
}
