import {BaseNodeClass} from './nodes/_Base';
import {PolyScene} from './scene/PolyScene';
import {RenderersController} from './poly/RenderersController';
import {
	NodesRegister,
	RegisterOptions,
	BaseNodeConstructor,
	OperationsRegister,
} from './poly/registers/nodes/NodesRegister';
import {ExpressionRegister} from './poly/registers/expressions/ExpressionRegister';
import {NodeContext} from './poly/NodeContext';
import {DynamicModulesRegister} from './poly/registers/modules/DynamicModulesRegister';
import {AssemblersRegister} from './poly/registers/assemblers/AssemblersRegistry';
import {BaseCoreLogger} from '../core/logger/Base';
import {BaseOperation} from '../core/operation/_Base';

// declaring in 2 lines because of combining ts-loader with webpack.DefinePlugin
// https://github.com/TypeStrong/ts-loader/issues/37
declare const POLYGONJS_VERSION: string;
const _POLYGONJS_VERSION = POLYGONJS_VERSION;

export class Poly {
	static _instance: Poly | undefined;
	public readonly renderers_controller: RenderersController = new RenderersController();
	public readonly nodes_register: NodesRegister = new NodesRegister();
	public readonly operations_register: OperationsRegister = new OperationsRegister();
	public readonly expressions_register: ExpressionRegister = new ExpressionRegister();
	public readonly modules_register: DynamicModulesRegister = new DynamicModulesRegister();
	public readonly assemblers_register: AssemblersRegister = new AssemblersRegister();
	// public readonly js_version: string = '0';
	scenes_by_uuid: Dictionary<PolyScene> = {};
	_env: string | undefined;
	private _version: Readonly<string> = _POLYGONJS_VERSION;
	private _player_mode: boolean = true;
	private _logger: BaseCoreLogger | null = null;
	// public viewer_loaders_manager: ViewerLoadersManager = new ViewerLoadersManager();

	static instance() {
		return (this._instance = this._instance || new Poly());
	}
	private constructor() {}

	version() {
		return this._version;
	}

	set_player_mode(mode: boolean) {
		this._player_mode = mode;
	}
	player_mode() {
		return this._player_mode;
	}

	register_node(node: BaseNodeConstructor, tab_menu_category?: string, options?: RegisterOptions) {
		this.nodes_register.register_node(node, tab_menu_category, options);
	}
	register_operation(operation: typeof BaseOperation) {
		this.operations_register.register_operation(operation);
	}
	registered_nodes(parent_context: NodeContext, type: string): Dictionary<typeof BaseNodeClass> {
		return this.nodes_register.registered_nodes(parent_context, type);
	}
	registered_operation(parent_context: NodeContext, operation_type: string): typeof BaseOperation | undefined {
		return this.operations_register.registered_operation(parent_context, operation_type);
	}
	in_worker_thread() {
		return false;
	}
	desktop_controller(): any {}
	// notify_scene_loaded(scene: PolyScene) {}

	//
	//
	// ENV
	//
	//
	set_env(env: string) {
		this._env = env;
	}
	get env() {
		return this._env;
	}

	//
	//
	// LOGGER
	//
	//
	set_logger(logger: BaseCoreLogger | null) {
		this._logger = logger;
	}
	get logger() {
		return this._logger;
	}

	log_engine_version() {
		this._logger?.log(`POLYGONJS: '${this._version}'`);
	}
	static log(message?: any, ...optionalParams: any[]) {
		this.instance().logger?.log(...[message, ...optionalParams]);
	}
	static warn(message?: any, ...optionalParams: any[]) {
		this.instance().logger?.warn(...[message, ...optionalParams]);
	}
	static error(message?: any, ...optionalParams: any[]) {
		this.instance().logger?.error(...[message, ...optionalParams]);
	}
}

// declare global {
// 	const POLY: Poly;
// }

// declare global {
// 	interface Window {
// 		POLY: Poly;
// 	}
// }
// make sure not to have library: 'POLY' in webpack for this to work
// export const POLY = Poly.instance();
