import {BaseNodeType} from 'src/engine/nodes/_Base';
import {BaseParam} from 'src/engine/params/_Base';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import jsep from 'jsep';

export class MissingExpressionReference {
	constructor(
		private param: BaseParam,
		private jsep_node: jsep.Expression,
		public full_path: string,
		public id: string
	) {
		console.log(this.jsep_node, this.param); // TODO: typescript, to not have the missing ref
	}

	resolve_with_node(node: BaseNodeType) {
		console.warn('this should not work! REFACTOR asap');
		// this.param.parse_expression_and_update_dependencies()
	}
}

export class ReferenceSearchResult {
	public found_graph_nodes: CoreGraphNode[] = [];
	public missing_paths: string[] = [];

	constructor() {}
	set_found_graph_nodes(graph_nodes: CoreGraphNode[]) {
		this.found_graph_nodes = graph_nodes;
	}
	set_missing_paths(paths: string[]) {
		this.missing_paths = paths;
	}
}

export interface MissingExpressionReferenceById {
	[propName: string]: MissingExpressionReference;
}
export interface MissingExpressionReferenceByIdByFullPath {
	[propName: string]: MissingExpressionReferenceById;
}
