import {PolyEngine} from '../../../Poly';
import {PolyPlugin, PolyPluginData, PolyPluginInterface} from './Plugin';
import {BaseNodeConstructor, BaseOperationConstructor} from '../nodes/NodesRegister';
import {NodeContext} from '../../NodeContext';
import {PolyDictionary} from '../../../../types/GlobalTypes';

export interface PluginsRegisterData {
	plugins: PolyDictionary<PolyPluginData>;
	nodes: PolyDictionary<PolyDictionary<string>>;
	operations: PolyDictionary<PolyDictionary<string>>;
}
export type WrapConfigurePolygonjsCallback = () => void | Promise<void>;

export class PluginsRegister {
	// private _inConfigurePolygonjs: boolean = false;
	private _configurePolygonjsPlugin: PolyPlugin | undefined;

	private _currentPlugin: PolyPluginInterface | undefined;
	private _pluginsByName: Map<string, PolyPluginInterface> = new Map();
	private _pluginNameByNodeContextByType: Map<NodeContext, Map<string, string>> = new Map();
	private _pluginNameByOperationContextByType: Map<NodeContext, Map<string, string>> = new Map();

	constructor(private poly: PolyEngine) {}

	async wrapConfigurePolygonjs(callback: WrapConfigurePolygonjsCallback) {
		this._configurePolygonjsPlugin =
			this._configurePolygonjsPlugin ||
			new PolyPlugin('configurePolygonjs', () => {}, {libraryImportPath: '../PolyConfig', libraryName: ''});

		this._currentPlugin = this._configurePolygonjsPlugin;
		this._pluginsByName.set(this._currentPlugin.name(), this._currentPlugin);
		await callback();
		this._currentPlugin = undefined;
	}

	register(plugin: PolyPluginInterface) {
		const previousCurrentPlugin = this._currentPlugin;
		this._currentPlugin = plugin;
		this._pluginsByName.set(plugin.name(), plugin);
		plugin.init(this.poly);
		this._currentPlugin = previousCurrentPlugin;
	}
	pluginByName(pluginName: string) {
		return this._pluginsByName.get(pluginName);
	}

	registerNode(node: BaseNodeConstructor) {
		if (!this._currentPlugin) {
			return;
		}
		const context = node.context();
		const type = node.type();
		let mapForContext = this._pluginNameByNodeContextByType.get(context);
		if (!mapForContext) {
			mapForContext = new Map();
			this._pluginNameByNodeContextByType.set(context, mapForContext);
		}
		mapForContext.set(type, this._currentPlugin.name());
	}
	registerOperation(operation: BaseOperationConstructor) {
		if (!this._currentPlugin) {
			return;
		}
		const context = operation.context();
		const type = operation.type();
		let mapForContext = this._pluginNameByOperationContextByType.get(context);
		if (!mapForContext) {
			mapForContext = new Map();
			this._pluginNameByOperationContextByType.set(context, mapForContext);
		}
		mapForContext.set(type, this._currentPlugin.name());
	}

	toJson() {
		const data: PluginsRegisterData = {
			plugins: {},
			nodes: {},
			operations: {},
		};

		this._pluginsByName.forEach((plugin, name) => {
			data.plugins[name] = plugin.toJSON();
		});

		this._pluginNameByNodeContextByType.forEach((mapForContext, context) => {
			data.nodes[context] = {};
			mapForContext.forEach((pluginName, type) => {
				data.nodes[context][type] = pluginName;
			});
		});
		this._pluginNameByOperationContextByType.forEach((mapForContext, context) => {
			data.operations[context] = {};
			mapForContext.forEach((pluginName, type) => {
				data.operations[context][type] = pluginName;
			});
		});

		return data;
	}
}
