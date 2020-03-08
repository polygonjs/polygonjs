import {BaseParamType} from '../params/_Base';
// import jsep from 'jsep';
import {CoreWalker} from '../../core/Walker';

export class MissingExpressionReference {
	constructor(private param: BaseParamType /*, private jsep_node: jsep.Expression*/, public path: string) {
		// console.log(this.jsep_node, this.param); // TODO: typescript, to not have the missing ref
	}

	matches_path(path: string): boolean {
		const absolute = CoreWalker.make_absolute_path(this.param.node, this.path);
		return absolute == path;
	}

	update_from_method_dependency_name_change() {
		this.param.expression_controller?.update_from_method_dependency_name_change();
	}

	resolve_missing_dependencies() {
		const input = this.param.raw_input_serialized;
		this.param.set(this.param.default_value);
		this.param.set(input);
		// parse_expression_and_update_dependencies()
	}
}

// export class ReferenceSearchResult {
// 	public found_graph_nodes: CoreGraphNode[] = [];
// 	public missing_paths: string[] = [];

// 	constructor() {}
// 	set_found_graph_nodes(graph_nodes: CoreGraphNode[]) {
// 		this.found_graph_nodes = graph_nodes;
// 	}
// 	set_missing_paths(paths: string[]) {
// 		this.missing_paths = paths;
// 	}
// }
