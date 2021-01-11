/**
 * returns the substr from a larger word
 *
 * @remarks
 * It takes 3 arguments
 *
 * strSub(<word\>, <start\>, <size\>)
 *
 * - **<word\>** - a string
 * - **<start\>** - the start position as a number
 * - **<size\>** - the number of characters to take, as a number
 *
 * ## Usage
 *
 * - `strSub('this is a word', 1, 2)` - returns 'hi'
 *
 */

import {BaseMethod} from './_Base';
// import {MethodDependency} from '../MethodDependency'

export class StrSubExpression extends BaseMethod {
	// str_chars_count('bla') => 3
	static required_arguments() {
		return [
			['string', 'string to get range from'],
			['integer', 'range start'],
			['integer', 'range size'],
		];
	}

	// find_dependency(index_or_path: number | string): MethodDependency | null {
	// 	return null;
	// 	// return this.create_dependency_from_index_or_path(index_or_path)
	// }

	async process_arguments(args: any[]): Promise<string> {
		let value = '';
		const string = args[0];
		const range_start = args[1] || 0;
		let range_size = args[2] || 1;
		if (string) {
			value = string.substr(range_start, range_size);
		}
		return value;
	}
}
