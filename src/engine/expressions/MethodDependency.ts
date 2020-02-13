import lodash_isNumber from 'lodash/isNumber';
// import BaseNode from 'src/engine/nodes/_Base'
import {DecomposedPath} from 'src/core/DecomposedPath';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {BaseParamType} from 'src/engine/params/_Base';
import {CoreObject} from 'src/core/Object';
import {BaseNodeType, BaseNodeClass, TypedNode} from 'src/engine/nodes/_Base';
import jsep from 'jsep';

type NodeOrParam = BaseNodeType | BaseParamType;

export class MethodDependency extends CoreGraphNode {
	public jsep_node: jsep.Expression | undefined;
	public resolved_graph_node: CoreGraphNode | undefined;
	public unresolved_path: string | undefined;
	private _update_from_name_change_bound = this._update_from_name_change.bind(this);

	constructor(
		public param: BaseParamType,
		public path_argument: number | string,
		public decomposed_path?: DecomposedPath
	) {
		super(param.scene, 'MethodDependency');

		// this.set_scene(this.param.scene);

		this.add_post_dirty_hook(this._update_from_name_change_bound);
	}
	_update_from_name_change(trigger?: CoreGraphNode) {
		if (CoreObject.is_a(trigger, TypedNode) && this.decomposed_path) {
			const node = trigger as BaseNodeType;
			this.decomposed_path.update_from_name_change(node);
			const new_path = this.decomposed_path.to_path();

			const literal = this.jsep_node as jsep.Literal;
			if (literal) {
				literal.value = `${literal.value}`.replace(`${this.path_argument}`, new_path);
				literal.raw = literal.raw.replace(`${this.path_argument}`, new_path);
			}
			if (this.param.expression_controller) {
				this.param.expression_controller.update_from_method_dependency_name_change();
			}
		}
	}
	reset() {
		this.graph_disconnect_predecessors();
	}

	listen_for_name_changes() {
		if (this.jsep_node && this.decomposed_path) {
			this.decomposed_path.named_nodes.forEach((node_in_path) => {
				if (node_in_path && node_in_path instanceof BaseNodeClass) {
					this.add_graph_input(node_in_path.name_controller.graph_node);
				}
			});
		}
	}

	set_jsep_node(jsep_node: jsep.Expression) {
		this.jsep_node = jsep_node;
	}
	set_resolved_graph_node(node: CoreGraphNode) {
		this.resolved_graph_node = node;
	}
	set_unresolved_path(path: string) {
		this.unresolved_path = path;
	}

	static create(
		param: BaseParamType,
		index_or_path: number | string,
		node: CoreGraphNode,
		nodes_in_path?: NodeOrParam[]
	) {
		const is_index = lodash_isNumber(index_or_path);

		let decomposed_path: DecomposedPath | undefined = undefined;
		if (nodes_in_path) {
			decomposed_path = new DecomposedPath();
			for (let node_in_path of nodes_in_path) {
				decomposed_path.add_node(node_in_path.name, node_in_path);
			}
		}

		const instance = new MethodDependency(param, index_or_path, decomposed_path);
		if (node) {
			instance.set_resolved_graph_node(node);
		} else {
			if (!is_index) {
				const path = index_or_path as string;
				instance.set_unresolved_path(path);
			}
		}
		return instance;
	}
}
