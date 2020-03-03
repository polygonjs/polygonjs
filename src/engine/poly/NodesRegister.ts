import {BaseNodeClass} from '../nodes/_Base';
import {NodeContext} from './NodeContext';

export interface RegisterOptions {
	only?: string[];
	except?: string[];
}

// export interface BaseNodeConstructor {
// 	new (): BaseNode;
// }

export type BaseNodeConstructor = typeof BaseNodeClass;
type NodeConstructorByType = Dictionary<BaseNodeConstructor>;
type NodeConstructorByTypeByContext = Dictionary<NodeConstructorByType>;
type TabMenuByTypeByContext = Dictionary<Dictionary<string>>;
type RegisterOptionsByTypeByContext = Dictionary<Dictionary<RegisterOptions>>;

export class NodesRegister {
	private _node_register: NodeConstructorByTypeByContext = {};
	private _node_register_categories: TabMenuByTypeByContext = {};
	private _node_register_options: RegisterOptionsByTypeByContext = {};

	register_node(node: BaseNodeConstructor, tab_menu_category?: string, options?: RegisterOptions) {
		const context = node.node_context();
		const node_type = node.type();
		this._node_register[context] = this._node_register[context] || {};

		const already_registered_node = this._node_register[context][node_type];
		if (already_registered_node) {
			throw new Error(`node ${context}/${node_type} already registered`);
		}
		this._node_register[context][node_type] = node;

		if (tab_menu_category) {
			this._node_register_categories[context] = this._node_register_categories[context] || {};
			this._node_register_categories[context][node_type] = tab_menu_category;
		}
		this._node_register_options[context] = this._node_register_options[context] || {};
		if (options) {
			this._node_register_options[context][node_type] = options;
		}
	}
	deregister_node(context: string, node_type: string) {
		delete this._node_register[context][node_type];
		delete this._node_register_categories[context][node_type];
		delete this._node_register_options[context][node_type];
	}
	registered_nodes_for_context_and_parent_type(context: NodeContext, parent_node_type: string) {
		const map = this._node_register[context];
		if (map) {
			const nodes_for_context = Object.values(this._node_register[context]);
			return nodes_for_context.filter((node) => {
				const options = this._node_register_options[context][node.type()];
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
						return option_except.includes(context_and_type);
					}
				}
				return !options || options['only']?.includes(parent_node_type);
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
		return this._node_register_categories[context][type];
	}
}
