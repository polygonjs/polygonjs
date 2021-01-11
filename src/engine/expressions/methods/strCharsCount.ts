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
import {BaseMethod} from './_Base';
// import {MethodDependency} from '../MethodDependency'

export class StrCharsCountExpression extends BaseMethod {
	// str_chars_count('bla') => 3
	static required_arguments() {
		return [['string', 'string to count characters of']];
	}

	// find_dependency(index_or_path: number | string): null {
	// 	return null
	// 	// return this.create_dependency_from_index_or_path(index_or_path)
	// }

	async process_arguments(args: any[]): Promise<number> {
		let value = 0;
		if (args.length == 1) {
			const string = args[0];
			value = string.length;
		}
		return value;
	}
}
