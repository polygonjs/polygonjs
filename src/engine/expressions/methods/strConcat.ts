/**
 * concats 2 strings
 *
 * @remarks
 * It takes 2 or more arguments, converts them to strings and concats them.
 *
 * strConcat(<word1\>, <word1\>, ...)
 *
 * - **<word1\>** - a string or number
 * - **<word2\>** - a string or number
 *
 * ## Usage
 *
 * - `strConcat('this ', 'is a word')` - returns 'this is a word'
 * - `strConcat(1,2)` - returns '12'
 * - `strConcat(1,"a")` - returns '1a'
 * - `strConcat("a",12, "b", " ", 17)` - returns 'a12b 17'
 *
 */
import {BaseMethod} from './_Base';
// import {MethodDependency} from '../MethodDependency'

export class StrConcatExpression extends BaseMethod {
	static required_arguments(): any[] {
		return [
			// ['string', 'string to get range from'],
			// ['integer', 'range start'],
			// ['integer', 'range size'],
		];
	}

	// find_dependency(index_or_path: number | string): null {
	// 	return null
	// 	// return this.create_dependency_from_index_or_path(index_or_path)
	// }

	async process_arguments(args: any[]): Promise<string> {
		let value = '';

		for (let arg of args) {
			if (arg == null) {
				arg = '';
			}
			value += `${arg}`;
		}

		return value;
	}
}
