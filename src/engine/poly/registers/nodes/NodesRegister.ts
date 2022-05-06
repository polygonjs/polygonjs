import {BaseNodeClass, BaseNodeType} from '../../../nodes/_Base';
import {BaseOperation} from '../../../operations/_Base';
import {NodeContext} from '../../NodeContext';
import {PolyEngine} from '../../../Poly';
import {PolyDictionary} from '../../../../types/GlobalTypes';

export interface OperationRegisterOptions {
	printWarnings?: boolean;
}
export interface NodeRegisterOptions {
	only?: string[];
	except?: string[];
	userAllowed?: boolean;
	polyNode?: boolean;
	printWarnings?: boolean;
}

// export interface BaseNodeConstructor {
// 	new (): BaseNode;
// }

export type BaseNodeConstructor = typeof BaseNodeClass;
type NodeConstructorByType = Map<string, BaseNodeConstructor>;
type NodeConstructorByTypeByContext = Map<NodeContext, NodeConstructorByType>;
type TabMenuByTypeByContext = Map<NodeContext, Map<string, string>>;
type RegisterOptionsByTypeByContext = Map<NodeContext, Map<string, NodeRegisterOptions>>;

export type BaseOperationConstructor = typeof BaseOperation;
type OperationConstructorByType = Map<string, BaseOperationConstructor>;
type OperationConstructorByTypeByContext = Map<NodeContext, OperationConstructorByType>;

export type OnNodeRegisterCallback = (poly: PolyEngine) => void;
export type OnOperationRegisterCallback = (poly: PolyEngine) => void;

export class NodesRegister {
	private _node_register: NodeConstructorByTypeByContext = new Map();
	private _node_register_categories: TabMenuByTypeByContext = new Map();
	private _node_register_options: RegisterOptionsByTypeByContext = new Map();

	constructor(private poly: PolyEngine) {}

	private static type(node: BaseNodeType | BaseNodeConstructor) {
		return this.filterType(node.type());
	}
	private static filterType(nodeType: string) {
		return nodeType.toLowerCase();
	}

	register(node: BaseNodeConstructor, tab_menu_category?: string, options?: NodeRegisterOptions) {
		const context = node.context();
		const nodeType = NodesRegister.type(node);
		let printWarnings = options?.printWarnings;
		if (printWarnings == null) {
			printWarnings = true;
		}

		let current_nodes_for_context = this._node_register.get(context);
		if (!current_nodes_for_context) {
			current_nodes_for_context = new Map();
			this._node_register.set(context, current_nodes_for_context);
		}

		const alreadyRegisteredNode = current_nodes_for_context.get(nodeType);
		if (alreadyRegisteredNode) {
			// if the node that is already registered is a polyNode, it can be overwritten by another polyNode.
			const isAlreadyRegisteredNodePolyNode =
				this._node_register_options.get(context)?.get(nodeType)?.polyNode == true;
			const isNewNodePolyNode = options?.polyNode == true;
			if (isAlreadyRegisteredNodePolyNode && isNewNodePolyNode) {
				// we don't show a warning or return if both are polyNodes
			} else {
				if (printWarnings) {
					console.warn(`node ${context}/${nodeType} already registered`);
				}
				return;
			}
		}
		current_nodes_for_context.set(nodeType, node);
		if (node.onRegister) {
			node.onRegister(this.poly);
		}

		if (tab_menu_category) {
			let current_categories = this._node_register_categories.get(context);
			if (!current_categories) {
				current_categories = new Map();
				this._node_register_categories.set(context, current_categories);
			}
			current_categories.set(nodeType, tab_menu_category);
		}

		if (options) {
			let current_options = this._node_register_options.get(context);
			if (!current_options) {
				current_options = new Map();
				this._node_register_options.set(context, current_options);
			}
			current_options.set(nodeType, options);
		}
		this.poly.pluginsRegister.registerNode(node);
	}
	deregister(context: NodeContext, nodeType: string) {
		nodeType = NodesRegister.filterType(nodeType);
		this._node_register.get(context)?.delete(nodeType);
		this._node_register_categories.get(context)?.delete(nodeType);
		this._node_register_options.get(context)?.delete(nodeType);
	}
	isRegistered(context: NodeContext, nodeType: string): boolean {
		const nodes_for_context = this._node_register.get(context);
		if (!nodes_for_context) {
			return false;
		}
		nodeType = NodesRegister.filterType(nodeType);
		return nodes_for_context.get(nodeType) != null;
	}
	nodeOptions(context: NodeContext, nodeType: string): NodeRegisterOptions | undefined {
		nodeType = NodesRegister.filterType(nodeType);
		return this._node_register_options.get(context)?.get(nodeType);
	}
	registeredNodesForParentNode(parentNode: BaseNodeType) {
		const context = parentNode.childrenController?.context;
		if (!context) {
			return [];
		}
		const map = this._node_register.get(context);
		if (map) {
			const nodes_for_context: BaseNodeConstructor[] = [];
			this._node_register.get(context)?.forEach((node, type) => {
				nodes_for_context.push(node);
			});
			return nodes_for_context.filter((node) => {
				const nodeType = NodesRegister.type(node);
				const options = this.nodeOptions(context, nodeType);
				if (!options) {
					return true;
				} else {
					const parentOptions = this.nodeOptions(parentNode.context(), parentNode.type());
					if (parentOptions?.polyNode == true) {
						// if parentNode is a polyNode, we should be able to create any node,
						// otherwise we would not be able to create gl/subnetInput and gl/subnetOutput
						// which would be problematic
						return true;
					}
					const option_only = options['only'];
					const option_except = options['except'];
					const context_and_type = `${parentNode.context()}/${parentNode.type()}`;
					if (option_only) {
						return option_only.includes(context_and_type);
					}
					if (option_except) {
						return !option_except.includes(context_and_type);
					}
					return true;
				}
			});
		} else {
			return [];
		}
	}
	registeredNodes(parentNode: BaseNodeType): PolyDictionary<BaseNodeConstructor> {
		const nodesByType: PolyDictionary<BaseNodeConstructor> = {};
		const nodes = this.registeredNodesForParentNode(parentNode);
		for (let node of nodes) {
			const nodeType = NodesRegister.type(node);
			nodesByType[nodeType] = node;
		}
		return nodesByType;
	}
	registeredCategory(context: NodeContext, nodeType: string) {
		nodeType = NodesRegister.filterType(nodeType);
		return this._node_register_categories.get(context)?.get(nodeType);
	}

	map() {
		return this._node_register;
	}
}

export class OperationsRegister {
	private _operation_register: OperationConstructorByTypeByContext = new Map();

	constructor(private poly: PolyEngine) {}

	private static type(node: BaseOperationConstructor) {
		return this.filterType(node.type());
	}
	private static filterType(nodeType: string) {
		return nodeType.toLowerCase();
	}

	register(operation: BaseOperationConstructor, options?: OperationRegisterOptions) {
		let printWarnings = options?.printWarnings;
		if (printWarnings == null) {
			printWarnings = true;
		}

		const context = operation.context();
		let current_operations_for_context = this._operation_register.get(context);
		if (!current_operations_for_context) {
			current_operations_for_context = new Map();
			this._operation_register.set(context, current_operations_for_context);
		}

		const operationType = OperationsRegister.type(operation);
		const already_registered_operation = current_operations_for_context.get(operationType);
		if (already_registered_operation) {
			if (printWarnings) {
				const message = `operation ${context}/${operationType} already registered`;
				console.warn(message);
			}
			return;
		}
		current_operations_for_context.set(operationType, operation);
		if (operation.onRegister) {
			operation.onRegister(this.poly);
		}
		this.poly.pluginsRegister.registerOperation(operation);
	}

	registeredOperationsForContextAndParentType(context: NodeContext, parentNodeType: string) {
		const map = this._operation_register.get(context);
		if (map) {
			const nodes_for_context: BaseOperationConstructor[] = [];
			this._operation_register.get(context)?.forEach((operation, type) => {
				nodes_for_context.push(operation);
			});
			return nodes_for_context;
		} else {
			return [];
		}
	}
	registeredOperation(context: NodeContext, operationType: string): BaseOperationConstructor | undefined {
		const current_operations_for_context = this._operation_register.get(context);
		if (current_operations_for_context) {
			operationType = OperationsRegister.filterType(operationType);
			return current_operations_for_context.get(operationType);
		}
	}
}
