import {BaseNodeClass} from '../../../nodes/_Base';
import {BaseOperation} from '../../../operations/_Base';
import {NodeContext} from '../../NodeContext';
import {PolyEngine} from '../../../Poly';
import {PolyDictionary} from '../../../../types/GlobalTypes';

export interface RegisterOptions {
	only?: string[];
	except?: string[];
	userAllowed?: boolean;
}

// export interface BaseNodeConstructor {
// 	new (): BaseNode;
// }

export type BaseNodeConstructor = typeof BaseNodeClass;
type NodeConstructorByType = Map<string, BaseNodeConstructor>;
type NodeConstructorByTypeByContext = Map<NodeContext, NodeConstructorByType>;
type TabMenuByTypeByContext = Map<NodeContext, Map<string, string>>;
type RegisterOptionsByTypeByContext = Map<NodeContext, Map<string, RegisterOptions>>;

export type BaseOperationConstructor = typeof BaseOperation;
type OperationConstructorByType = Map<string, BaseOperationConstructor>;
type OperationConstructorByTypeByContext = Map<NodeContext, OperationConstructorByType>;

export class NodesRegister {
	private _node_register: NodeConstructorByTypeByContext = new Map();
	private _node_register_categories: TabMenuByTypeByContext = new Map();
	private _node_register_options: RegisterOptionsByTypeByContext = new Map();

	constructor(private poly: PolyEngine) {}

	register(node: BaseNodeConstructor, tab_menu_category?: string, options?: RegisterOptions) {
		const context = node.context();
		const nodeType = node.type().toLowerCase();

		let current_nodes_for_context = this._node_register.get(context);
		if (!current_nodes_for_context) {
			current_nodes_for_context = new Map();
			this._node_register.set(context, current_nodes_for_context);
		}

		const already_registered_node = current_nodes_for_context.get(nodeType);
		if (already_registered_node) {
			console.error(`node ${context}/${nodeType} already registered`);
			return;
		}
		current_nodes_for_context.set(nodeType, node);

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
	deregister(context: NodeContext, node_type: string) {
		this._node_register.get(context)?.delete(node_type);
		this._node_register_categories.get(context)?.delete(node_type);
		this._node_register_options.get(context)?.delete(node_type);
	}
	isRegistered(context: NodeContext, type: string): boolean {
		const nodes_for_context = this._node_register.get(context);
		if (!nodes_for_context) {
			return false;
		}
		return nodes_for_context.get(type) != null;
	}
	registeredNodesForContextAndParentType(context: NodeContext, parent_node_type: string) {
		const map = this._node_register.get(context);
		if (map) {
			const nodes_for_context: BaseNodeConstructor[] = [];
			this._node_register.get(context)?.forEach((node, type) => {
				nodes_for_context.push(node);
			});
			return nodes_for_context.filter((node) => {
				const nodeType = node.type().toLowerCase();
				const options = this._node_register_options.get(context)?.get(nodeType);
				if (!options) {
					return true;
				} else {
					const option_only = options['only'];
					const option_except = options['except'];
					const context_and_type = `${context}/${parent_node_type}`;
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
	registeredNodes(context: NodeContext, parent_node_type: string): PolyDictionary<BaseNodeConstructor> {
		const nodesByType: PolyDictionary<BaseNodeConstructor> = {};
		const nodes = this.registeredNodesForContextAndParentType(context, parent_node_type);
		for (let node of nodes) {
			const type = node.type().toLowerCase();
			nodesByType[type] = node;
		}
		return nodesByType;
	}
	registeredCategory(context: NodeContext, type: string) {
		return this._node_register_categories.get(context)?.get(type.toLowerCase());
	}

	map() {
		return this._node_register;
	}
}

export class OperationsRegister {
	private _operation_register: OperationConstructorByTypeByContext = new Map();

	constructor(private poly: PolyEngine) {}

	register(operation: BaseOperationConstructor) {
		const context = operation.context();
		let current_operations_for_context = this._operation_register.get(context);
		if (!current_operations_for_context) {
			current_operations_for_context = new Map();
			this._operation_register.set(context, current_operations_for_context);
		}

		const operationType = operation.type().toLowerCase();
		const already_registered_operation = current_operations_for_context.get(operationType);
		if (already_registered_operation) {
			const message = `operation ${context}/${operationType} already registered`;
			console.error(message);
			return;
		}
		current_operations_for_context.set(operationType, operation);
		this.poly.pluginsRegister.registerOperation(operation);
	}

	registeredOperationsForContextAndParentType(context: NodeContext, parent_node_type: string) {
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
			return current_operations_for_context.get(operationType.toLowerCase());
		}
	}
}
