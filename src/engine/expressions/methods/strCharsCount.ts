/**
 * returns the number of character of a word
 *
 * @remarks
 * It takes 1 arguments.
 *
 * strCharCount(<word\>)
 *
 * - **<word\>** - word to returns the number of characters of
 *
 * ## Usage
 *
 * - `strCharCount('a word')` - returns 6
 *
 */
import {CoreType} from './../../../core/Type';
import {BaseMethod} from './_Base';
// import {MethodDependency} from '../MethodDependency'

export class StrCharsCountExpression extends BaseMethod {
	// str_chars_count('bla') => 3
	static override requiredArguments() {
		return [['string', 'string to count characters of']];
	}

	// findDependency(index_or_path: number | string): null {
	// 	return null
	// 	// return this.createDependencyFromIndexOrPath(index_or_path)
	// }

	override async processArguments(args: any[]): Promise<number> {
		let value = 0;
		if (args.length == 1) {
			const string = args[0];
			if (CoreType.isString(string)) {
				value = string.length;
			}
		}
		return value;
	}
}
