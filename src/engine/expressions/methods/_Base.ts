import {CoreWalker} from '../../../core/Walker';
import {DecomposedPath} from '../../../core/DecomposedPath';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../../nodes/_Base';
import {MethodDependency} from '../MethodDependency';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {BaseContainer} from '../../containers/_Base';
import {ContainerMap} from '../../containers/utils/ContainerMap';
import {NodeContext} from '../../poly/NodeContext';
import {Poly} from '../../Poly';
import {CoreType} from '../../../core/Type';

export class BaseMethod {
	protected _requireDependency = false;
	requireDependency() {
		return this._requireDependency;
	}

	constructor(public readonly param: BaseParamType) {}
	// the node is not fetched from the param in the constructor,
	// since the param may not have a node yet, especially when the param's value
	// is set on node creation
	private _node: BaseNodeType | undefined;
	protected node(): BaseNodeType | undefined {
		return (this._node = this._node || this.param.node);
	}

	static requiredArguments(): any[] {
		console.warn('Expression.Method._Base.required_arguments virtual method call. Please override');
		return [];
	}
	static optionalArguments(): any[] {
		return [];
	}
	static minAllowedArgumentsCount() {
		return this.requiredArguments().length;
	}
	static maxAllowedArgumentsCount() {
		return this.minAllowedArgumentsCount() + this.optionalArguments().length;
	}
	static allowedArgumentsCount(count: number) {
		return count >= this.minAllowedArgumentsCount() && count <= this.maxAllowedArgumentsCount();
	}

	processArguments(args: any): Promise<any> {
		throw 'Expression.Method._Base.process_arguments virtual method call. Please override';
	}

	async getReferencedNodeContainer(index_or_path: number | string): Promise<BaseContainer> {
		const referenced_node = this.getReferencedNode(index_or_path);

		if (referenced_node) {
			let container: ContainerMap[NodeContext];
			if (referenced_node.isDirty()) {
				container = await referenced_node.compute();
			} else {
				container = referenced_node.containerController.container();
			}
			if (container) {
				const core_group = container.coreContent();
				if (core_group) {
					return container;
				}
			}
			throw `referenced node invalid: ${referenced_node.path()}`;
		} else {
			throw `invalid input (${index_or_path})`;
		}
	}

	getReferencedParam(path: string, decomposed_path?: DecomposedPath): BaseParamType | null {
		const node = this.node();
		if (node) {
			return CoreWalker.findParam(node, path, decomposed_path);
		}

		// if (referenced_param != null) {

		// 	if (this.update_dependencies_mode()) {

		// 		//param_connect_result = this.param().addGraphInput(referenced_param)
		// 		const expression_node_connect_result = this.jsep_node()._graph_node.addGraphInput(referenced_param);
		// 		//if !(param_connect_result && expression_node_connect_result)
		// 		if (!expression_node_connect_result) {
		// 			throw "cannot create infinite graph";
		// 		}
		// 	}

		// } else {
		// 	throw `no param found for argument ${path}`;
		// }

		return null;
	}

	findReferencedGraphNode(index_or_path: number | string, decomposed_path?: DecomposedPath): CoreGraphNode | null {
		const is_index = CoreType.isNumber(index_or_path);
		// let node
		if (is_index) {
			const index = index_or_path as number;
			const node = this.node();
			if (node) {
				const input_graph_node = node.io.inputs.inputGraphNode(index);
				return input_graph_node;
			}
		} else {
			const path = index_or_path as string;
			return this.getReferencedNode(path, decomposed_path);
		}
		return null;
	}
	// caching the node by path here prevents having expressions such as points_count(0)
	// evaluate to an error when the input is disconnected
	// private _node_by_path: Map<string | number, BaseNodeType | null | undefined> = new Map();
	getReferencedNode(index_or_path: string | number, decomposed_path?: DecomposedPath): BaseNodeType | null {
		// let node = this._node_by_path.get(index_or_path);
		// if (node) {
		// 	return node;
		// } else {
		let node: BaseNodeType | null = null;
		const current_node = this.node();
		if (CoreType.isString(index_or_path)) {
			if (current_node) {
				const path = index_or_path;
				node = CoreWalker.findNode(current_node, path, decomposed_path);
			}
		} else {
			if (current_node) {
				const index = index_or_path;
				node = current_node.io.inputs.input(index);
			}
		}
		// this._node_by_path.set(index_or_path, node);
		return node || null;
		//}
	}

	findDependency(arg: string | number): MethodDependency | null {
		return null;
	}

	protected createDependencyFromIndexOrPath(index_or_path: number | string): MethodDependency | null {
		const decomposed_path = new DecomposedPath();
		const node = this.findReferencedGraphNode(index_or_path, decomposed_path);
		if (node) {
			return this.createDependency(node, index_or_path, decomposed_path);
		} else {
			Poly.warn('node not found for path', index_or_path);
		}
		return null;
	}
	protected createDependency(
		node: CoreGraphNode,
		index_or_path: number | string,
		decomposed_path?: DecomposedPath
	): MethodDependency | null {
		const dependency = MethodDependency.create(this.param, index_or_path, node, decomposed_path);
		return dependency;
	}
}
