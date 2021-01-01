import {Poly} from '../../../Poly';
import {PolyPlugin} from './Plugin';
import {BaseNodeConstructor, BaseOperationConstructor} from '../nodes/NodesRegister';
import {NodeContext} from '../../NodeContext';

export interface PluginsRegisterData {
	nodes: Dictionary<Dictionary<string>>;
	operations: Dictionary<Dictionary<string>>;
}

export class PluginsRegister {
	private _current_plugin: PolyPlugin | undefined;
	private _plugins_by_name: Map<string, PolyPlugin> = new Map();
	private _plugin_name_by_node_context_by_type: Map<NodeContext, Map<string, string>> = new Map();
	private _plugin_name_by_operation_context_by_type: Map<NodeContext, Map<string, string>> = new Map();

	constructor(private poly: Poly) {}

	register(plugin: PolyPlugin) {
		this._current_plugin = plugin;
		this._plugins_by_name.set(plugin.name(), plugin);
		plugin.init(this.poly);
		this._current_plugin = undefined;
	}
	pluginByName(pluginName: string) {
		return this._plugins_by_name.get(pluginName);
	}

	registerNode(node: BaseNodeConstructor) {
		if (!this._current_plugin) {
			return;
		}
		const context = node.node_context();
		const type = node.type();
		let map_for_context = this._plugin_name_by_node_context_by_type.get(context);
		if (!map_for_context) {
			map_for_context = new Map();
			this._plugin_name_by_node_context_by_type.set(context, map_for_context);
		}
		map_for_context.set(type, this._current_plugin.name());
	}
	registerOperation(operation: BaseOperationConstructor) {
		if (!this._current_plugin) {
			return;
		}
		const context = operation.context();
		const type = operation.type();
		let map_for_context = this._plugin_name_by_operation_context_by_type.get(context);
		if (!map_for_context) {
			map_for_context = new Map();
			this._plugin_name_by_operation_context_by_type.set(context, map_for_context);
		}
		map_for_context.set(type, this._current_plugin.name());
	}

	toJson() {
		const data: PluginsRegisterData = {
			nodes: {},
			operations: {},
		};

		this._plugin_name_by_node_context_by_type.forEach((map_for_context, context) => {
			data.nodes[context] = {};
			map_for_context.forEach((plugin_name, type) => {
				data.nodes[context][type] = plugin_name;
			});
		});
		this._plugin_name_by_operation_context_by_type.forEach((map_for_context, context) => {
			data.operations[context] = {};
			map_for_context.forEach((plugin_name, type) => {
				data.operations[context][type] = plugin_name;
			});
		});

		return data;
	}
}
