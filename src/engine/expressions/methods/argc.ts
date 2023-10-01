/**
 * Returns the number of arguments in a space-separated arguments list
 *
 * @remarks
 * It takes 1 argument.
 *
 * `argc(arguments)`
 *
 * - `<arguments` space-separated arguments list
 *
 * ## Usage
 *
 * - `argc('a b c')` - returns 3
 *
 */

import {BaseMethod} from './_Base';

export class ArgcExpression extends BaseMethod {
	static override requiredArguments() {
		return [['string', 'arguments list']];
	}

	override async processArguments(args: any[]): Promise<any> {
		if (args.length == 1) {
			const argumentsList = args[0];
			const val = argumentsList.split(' ').length;
			return val;
		}
		return 0;
	}
}
