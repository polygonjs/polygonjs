import {PolyEngine} from '../../../Poly';
import {PolyPluginData, PolyPlugin} from './Plugin';
import {BaseNodeConstructor, BaseOperationConstructor} from '../nodes/NodesRegister';
import {NodeContext} from '../../NodeContext';
import {PolyDictionary} from '../../../../types/GlobalTypes';

export interface PluginsRegisterData {
	plugins: PolyDictionary<PolyPluginData>;
	nodes: PolyDictionary<PolyDictionary<string>>;
	operations: PolyDictionary<PolyDictionary<string>>;
}

export class PluginsRegister {
	private _current_plugin: PolyPlugin | undefined;
	private _plugins_by_name: Map<string, PolyPlugin> = new Map();
	private _plugin_name_by_node_context_by_type: Map<NodeContext, Map<string, string>> = new Map();
	private _plugin_name_by_operation_context_by_type: Map<NodeContext, Map<string, string>> = new Map();

	constructor(private poly: PolyEngine) {}

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
		const context = node.context();
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
			plugins: {},
			nodes: {},
			operations: {},
		};

		this._plugins_by_name.forEach((plugin, name) => {
			data.plugins[name] = plugin.toJSON();
		});

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
