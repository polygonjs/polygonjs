import {BaseNodeClass} from '../../../nodes/_Base';
import {BaseOperation} from '../../../../core/operation/_Base';
import {NodeContext} from '../../NodeContext';

export interface RegisterOptions {
	only?: string[];
	except?: string[];
	user_allowed?: boolean;
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

	register_node(node: BaseNodeConstructor, tab_menu_category?: string, options?: RegisterOptions) {
		const context = node.node_context();
		const node_type = node.type();
		let current_nodes_for_context = this._node_register.get(context);
		if (!current_nodes_for_context) {
			current_nodes_for_context = new Map();
			this._node_register.set(context, current_nodes_for_context);
		}

		const already_registered_node = current_nodes_for_context.get(node_type);
		if (already_registered_node) {
			throw new Error(`node ${context}/${node_type} already registered`);
		}
		current_nodes_for_context.set(node_type, node);

		if (tab_menu_category) {
			let current_categories = this._node_register_categories.get(context);
			if (!current_categories) {
				current_categories = new Map();
				this._node_register_categories.set(context, current_categories);
			}
			current_categories.set(node_type, tab_menu_category);
		}

		if (options) {
			let current_options = this._node_register_options.get(context);
			if (!current_options) {
				current_options = new Map();
				this._node_register_options.set(context, current_options);
			}
			current_options.set(node_type, options);
		}
	}
	deregister_node(context: NodeContext, node_type: string) {
		this._node_register.get(context)?.delete(node_type);
		this._node_register_categories.get(context)?.delete(node_type);
		this._node_register_options.get(context)?.delete(node_type);
	}
	registered_nodes_for_context_and_parent_type(context: NodeContext, parent_node_type: string) {
		const map = this._node_register.get(context);
		if (map) {
			const nodes_for_context: BaseNodeConstructor[] = [];
			this._node_register.get(context)?.forEach((node, type) => {
				nodes_for_context.push(node);
			});
			return nodes_for_context.filter((node) => {
				const options = this._node_register_options.get(context)?.get(node.type());
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
	registered_nodes(context: NodeContext, parent_node_type: string): Dictionary<BaseNodeConstructor> {
		const nodes_by_type: Dictionary<BaseNodeConstructor> = {};
		const nodes = this.registered_nodes_for_context_and_parent_type(context, parent_node_type);
		for (let node of nodes) {
			const type = node.type();
			nodes_by_type[type] = node;
		}
		return nodes_by_type;
	}
	registered_category(context: NodeContext, type: string) {
		return this._node_register_categories.get(context)?.get(type);
	}

	map() {
		return this._node_register;
	}
}

export class OperationsRegister {
	private _operation_register: OperationConstructorByTypeByContext = new Map();

	register_operation(operation: BaseOperationConstructor) {
		const context = operation.context();
		let current_operations_for_context = this._operation_register.get(context);
		if (!current_operations_for_context) {
			current_operations_for_context = new Map();
			this._operation_register.set(context, current_operations_for_context);
		}

		const operation_type = operation.type();
		const already_registered_operation = current_operations_for_context.get(operation_type);
		if (already_registered_operation) {
			const message = `operation ${context}/${operation_type} already registered`;
			console.error(message);
			throw new Error(message);
		}
		current_operations_for_context.set(operation_type, operation);
	}

	registered_operations_for_context_and_parent_type(context: NodeContext, parent_node_type: string) {
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
	registered_operation(context: NodeContext, operation_type: string): BaseOperationConstructor | undefined {
		const current_operations_for_context = this._operation_register.get(context);
		if (current_operations_for_context) {
			return current_operations_for_context.get(operation_type);
		}
	}
}
