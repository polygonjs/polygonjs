/**
 * Returns the value of another parameter
 *
 * @remarks
 * It takes 1 argument, the path to the parameter.
 *
 * ch(<param_path\>)
 *
 * - **<param_path\>** is a string, which can be the absolute or relative path
 *
 * ## Usage
 *
 * - `ch('./tx')` - returns the value of the parameter tx of the same node
 * - `ch('/geo1/tx')` - returns the value of the tx of the node /geo1
 *
 */
import {BaseMethod} from './_Base';
import {DecomposedPath} from '../../../core/DecomposedPath';
import {MethodDependency} from '../MethodDependency';

export class ChExpression extends BaseMethod {
	protected _require_dependency = true;

	static requiredArguments() {
		return [['string', 'path to param']];
	}

	findDependency(index_or_path: number | string): MethodDependency | null {
		const decomposed_path = new DecomposedPath();
		const param = this.getReferencedParam(index_or_path as string, decomposed_path);
		if (param) {
			return this.createDependency(param, index_or_path, decomposed_path);
		}
		return null;
	}

	async processArguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			let val: any = 0;
			if (args.length == 1) {
				const path = args[0];
				const ref = this.getReferencedParam(path);
				if (ref) {
					if (ref.isDirty()) {
						await ref.compute();
					}
					const result = ref.value;
					if (result != null) {
						// if (CoreType.isNumber(result)) {
						val = result;
						resolve(val);
						// }
					}
				} else {
					reject(0);
				}
			}
		});
	}
}
