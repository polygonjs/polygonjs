/**
 * returns the index of a character inside a string
 *
 * @remarks
 * It takes 2 arguments
 *
 * strIndex(<word\>, <character\>)
 *
 * - **<word\>** - a string
 * - **<character\>** - a string
 *
 * ## Usage
 *
 * - `strIndex('abcd ', 'c')` - returns 2
 *
 */
import {BaseMethod} from './_Base';
// import {MethodDependency} from '../MethodDependency'

export class StrIndexExpression extends BaseMethod {
	// str_chars_count('bla') => 3
	static override requiredArguments() {
		return [
			['string', 'string to get index from'],
			['string', 'char to find index of'],
		];
	}

	// findDependency(index_or_path: number | string): null {
	// 	return null
	// 	// return this.createDependencyFromIndexOrPath(index_or_path)
	// }

	override async processArguments(args: any[]): Promise<number> {
		let value = -1;
		if (args.length == 2) {
			const string = args[0];
			const sub_string = args[1];
			value = string.indexOf(sub_string);
		}
		return value;
	}
}
