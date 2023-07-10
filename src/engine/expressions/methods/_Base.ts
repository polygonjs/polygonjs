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

export interface BaseMethodFindDependencyArgs {
	indexOrPath: string | number | undefined;
	node?: BaseNodeType;
}
export class BaseMethod {
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

	async getReferencedNodeContainer(indexOrPath: number | string): Promise<BaseContainer> {
		const referencedNode = this.getReferencedNode(indexOrPath);

		if (referencedNode) {
			let container: ContainerMap[NodeContext];
			if (referencedNode.isDirty() || referencedNode.flags?.bypass?.active()) {
				container = await referencedNode.compute();
			} else {
				container = referencedNode.containerController.container();
			}
			if (container) {
				const coreContent = container.coreContent();
				if (coreContent != null) {
					return container;
				}
			}
			throw `referenced node invalid: ${referencedNode.path()}`;
		} else {
			throw `invalid input (${indexOrPath})`;
		}
	}

	getReferencedParam(path: string, decomposedPath?: DecomposedPath): BaseParamType | null {
		const node = this.node();
		if (node) {
			return CoreWalker.findParam(node, path, decomposedPath);
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

	findReferencedGraphNode(indexOrPath: number | string, decomposedPath?: DecomposedPath): CoreGraphNode | null {
		const is_index = CoreType.isNumber(indexOrPath);
		// let node
		if (is_index) {
			const index = indexOrPath as number;
			const node = this.node();
			if (node) {
				const input_graph_node = node.io.inputs.inputGraphNode(index);
				return input_graph_node;
			}
		} else {
			const path = indexOrPath as string;
			return this.getReferencedNode(path, decomposedPath);
		}
		return null;
	}
	// caching the node by path here prevents having expressions such as points_count(0)
	// evaluate to an error when the input is disconnected
	// private _node_by_path: Map<string | number, BaseNodeType | null | undefined> = new Map();
	getReferencedNode(indexOrPath: string | number, decomposedPath?: DecomposedPath): BaseNodeType | null {
		// let node = this._node_by_path.get(indexOrPath);
		// if (node) {
		// 	return node;
		// } else {
		let node: BaseNodeType | null = null;
		const current_node = this.node();
		if (CoreType.isString(indexOrPath)) {
			if (current_node) {
				const path = indexOrPath;
				node = CoreWalker.findNode(current_node, path, decomposedPath);
			}
		} else {
			if (current_node) {
				const index = indexOrPath;
				node = current_node.io.inputs.input(index);
			}
		}
		// this._node_by_path.set(indexOrPath, node);
		return node || null;
		//}
	}

	findDependency(arg: BaseMethodFindDependencyArgs): MethodDependency | null {
		return null;
	}

	protected createDependencyFromIndexOrPath(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		if (this.param.disposed() == true) {
			return null;
		}
		const {indexOrPath} = args;
		const decomposedPath = new DecomposedPath();
		const node = indexOrPath != null ? this.findReferencedGraphNode(indexOrPath, decomposedPath) : args.node;
		if (node) {
			return this.createDependency(node, args, decomposedPath);
		} else {
			Poly.warn(`node not found for path '${indexOrPath}' from param '${this.param.path()}'`);
		}
		return null;
	}
	protected createDependency(
		node: CoreGraphNode,
		pathArgs: BaseMethodFindDependencyArgs,
		decomposedPath?: DecomposedPath
	): MethodDependency | null {
		const dependency = MethodDependency.create(this.param, pathArgs, node, decomposedPath);
		return dependency;
	}
}
