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

	static required_arguments() {
		return [['string', 'path to param']];
	}

	find_dependency(index_or_path: number | string): MethodDependency | null {
		const decomposed_path = new DecomposedPath();
		const param = this.get_referenced_param(index_or_path as string, decomposed_path);
		if (param) {
			return this.create_dependency(param, index_or_path, decomposed_path);
		}
		return null;
	}

	async process_arguments(args: any[]): Promise<any> {
		let val: any = 0;
		if (args.length == 1) {
			const path = args[0];
			const ref = this.get_referenced_param(path);
			if (ref) {
				if (ref.is_dirty) {
					await ref.compute();
				}
				const result = ref.value;
				if (result != null) {
					// if (CoreType.isNumber(result)) {
					val = result;
					// }
				}
			}
		}
		return val;
	}
}
