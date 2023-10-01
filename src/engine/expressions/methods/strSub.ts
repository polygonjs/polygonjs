/**
 * returns the substr from a larger word
 *
 * @remarks
 * It takes 3 arguments
 *
 * `strSub(word, start, size)`
 *
 * - `word` - a string
 * - `start` - the start position as a number
 * - `size` - the number of characters to take, as a number
 *
 * ## Usage
 *
 * - `strSub('this is a word', 1, 2)` - returns 'hi'
 *
 */

import {CoreType} from '../../../core/Type';
import {BaseMethod} from './_Base';
// import {MethodDependency} from '../MethodDependency'

function toString(arg: any) {
	if (arg == null) {
		return '';
	}
	return CoreType.isString(arg) ? arg : `${arg}`;
}
function toInt(arg: any, defaultVal: number) {
	if (arg == null) {
		return defaultVal;
	}
	return CoreType.isNumber(arg) ? arg : parseInt(arg);
}
export class StrSubExpression extends BaseMethod {
	// str_chars_count('bla') => 3
	static override requiredArguments() {
		return [
			['string', 'string to get range from'],
			['integer', 'range start'],
			['integer', 'range size'],
		];
	}

	// findDependency(index_or_path: number | string): MethodDependency | null {
	// 	return null;
	// 	// return this.createDependencyFromIndexOrPath(index_or_path)
	// }

	override async processArguments(args: any[]): Promise<string> {
		const string = toString(args[0]);
		const rangeStart = toInt(args[1], 0);
		let rangeSize = toInt(args[2], 1);

		if (string) {
			return string.substring(rangeStart, rangeStart + rangeSize);
		}
		return '';
	}
}
