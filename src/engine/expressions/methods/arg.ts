/**
 * Returns one argument from a space-separated arguments list
 *
 * @remarks
 * It takes 2 arguments.
 *
 * arg(<arguments\>, <index\>)
 *
 * - **<arguments\>** space-separated arguments list
 * - **<index\>** index of argument to return
 *
 * ## Usage
 *
 * - `opnane('a b c', 1)` - returns '1'
 * - `opname('this is great or is it not', 2)` - returns 'great'
 *
 */

import {BaseMethod} from './_Base';

export class ArgExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [
			['string', 'arguments list'],
			['number', 'index'],
		];
	}

	override processArguments(args: any[]): Promise<any> {
		return new Promise((resolve, reject) => {
			if (args.length == 2) {
				const argumentsList = args[0];
				const index = args[1];
				const val = argumentsList.split(' ')[index];
				resolve(val);
			} else {
				resolve(0);
			}
		});
	}
}
