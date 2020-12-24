
import {BaseMethod} from './_Base';
import {DecomposedPath} from '../../../core/DecomposedPath';
import {MethodDependency} from '../MethodDependency';
// import Walker from 'src/core/Walker';

export class ChExpression extends BaseMethod {
	protected _require_dependency = true;

	static required_arguments() {
		return [['string', 'path to param']];
	}

	// dependencies(args: any[]): any[]{
	// 	const path = args[0]
	// 	return [this.get_referenced_param(path)]
	// }
	find_dependency(index_or_path: number | string): MethodDependency | null {
		const decomposed_path = new DecomposedPath();
		const param = this.get_referenced_param(index_or_path as string, decomposed_path);
		if (param) {
			return this.create_dependency(param, index_or_path, decomposed_path);
		}
		return null;
		// const reference_search_result = new ReferenceSearchResult()
		// const param = this.get_referenced_param(index_or_path)
		// if(param){
		// 	reference_search_result.set_found_graph_nodes([param])
		// } else {
		// 	reference_search_result.set_missing_paths([path])
		// }

		// return reference_search_result
	}
	// find_dependencies(index_or_path: number|string): MethodDependency{
	// }

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

	// _get_param_value(path, callback){
	// 	return this.get_referenced_param(path).eval(val=> {
	// 		return callback(val);
	// 	});
	// }
}
