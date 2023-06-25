import {BaseMethodFindDependencyArgs} from './methods/_Base';
import {DecomposedPath} from '../../core/DecomposedPath';
import {CoreGraphNode} from '../../core/graph/CoreGraphNode';
import {BaseParamType} from '../params/_Base';
import {BaseNodeType} from '../nodes/_Base';
import jsep from 'jsep';
import {CoreType} from '../../core/Type';

export class MethodDependency extends CoreGraphNode {
	public jsep_node: jsep.Expression | undefined;
	public resolved_graph_node: CoreGraphNode | undefined;
	public unresolved_path: string | undefined;
	private _updateFromNameChangeBound = this._updateFromNameChange.bind(this);

	constructor(
		public param: BaseParamType,
		public pathArgs: BaseMethodFindDependencyArgs,
		public decomposedPath?: DecomposedPath
	) {
		super(param.scene(), 'MethodDependency');

		param.expressionController?.registerMethodDependency(this);

		this.addPostDirtyHook('_updateFromNameChange', this._updateFromNameChangeBound);
	}
	private _updateFromNameChange(trigger?: CoreGraphNode) {
		if (trigger && this.decomposedPath) {
			const node = trigger as BaseNodeType;
			this.decomposedPath.updateFromNameChange(node);
			const new_path = this.decomposedPath.toPath();

			const literal = this.jsep_node as jsep.Literal;
			const {indexOrPath} = this.pathArgs;
			if (literal && CoreType.isString(indexOrPath)) {
				literal.value = `${literal.value}`.replace(`${indexOrPath}`, new_path);
				literal.raw = literal.raw.replace(`${indexOrPath}`, new_path);
			}
			if (this.param.expressionController) {
				this.param.expressionController.updateFromMethodDependencyNameChange();
			}
		}
	}
	reset() {
		this.graphDisconnectPredecessors();
	}

	listen_for_name_changes() {
		if (this.jsep_node && this.decomposedPath) {
			for (let node_in_path of this.decomposedPath.namedNodes()) {
				if (node_in_path) {
					const node = node_in_path as BaseNodeType;
					if (node.nameController) {
						this.addGraphInput(node.nameController.graphNode());
					}
				}
			}
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
		pathArgs: BaseMethodFindDependencyArgs,
		node: CoreGraphNode,
		decomposedPath?: DecomposedPath
	) {
		// if(!decomposed_path){
		// 	console.log('nodes_in_path', decomposed_path.named_nodes);
		// 	for (let node_in_path of decomposed_path.named_nodes) {
		// 		if (node_in_path) {
		// 			decomposed_path.add_node(node_in_path.name, node_in_path);
		// 		}
		// 	}
		// }

		const instance = new MethodDependency(param, pathArgs, decomposedPath);
		if (node) {
			instance.set_resolved_graph_node(node);
		} else {
			const {indexOrPath} = pathArgs;
			if (CoreType.isString(indexOrPath)) {
				instance.set_unresolved_path(indexOrPath);
			}
		}
		return instance;
	}
}
