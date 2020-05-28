import {BaseNodeClass} from './nodes/_Base';
import {PolyScene} from './scene/PolyScene';
import {RenderersController} from './poly/RenderersController';
import {NodesRegister, RegisterOptions, BaseNodeConstructor} from './poly/registers/nodes/NodesRegister';
import {ExpressionRegister} from './poly/registers/expressions/ExpressionRegister';
import {NodeContext} from './poly/NodeContext';
import {DynamicModulesRegister} from './poly/registers/dynamic_modules/DynamicModulesRegister';
// import {ViewerLoadersManager} from '/viewers/LoadersManager';

// declaring in 2 lines because of combining ts-loader with webpack.DefinePlugin
// https://github.com/TypeStrong/ts-loader/issues/37
declare const POLYGONJS_VERSION: string;
const _POLYGONJS_VERSION = POLYGONJS_VERSION;

export class Poly {
	static _instance: Poly | undefined;
	public readonly renderers_controller: RenderersController = new RenderersController();
	public readonly nodes_register: NodesRegister = new NodesRegister();
	public readonly expressions_register: ExpressionRegister = new ExpressionRegister();
	public readonly dynamic_modules_register: DynamicModulesRegister = new DynamicModulesRegister();
	// public readonly js_version: string = '0';
	scenes_by_uuid: Dictionary<PolyScene> = {};
	_env: string | undefined;
	private _version: Readonly<string> = _POLYGONJS_VERSION;
	// public viewer_loaders_manager: ViewerLoadersManager = new ViewerLoadersManager();

	static instance() {
		return (this._instance = this._instance || new Poly());
	}
	private constructor() {
		console.log(`POLYGONJS: '${this._version}'`);
	}

	version() {
		return this._version;
	}

	register_node(node: BaseNodeConstructor, tab_menu_category?: string, options?: RegisterOptions) {
		this.nodes_register.register_node(node, tab_menu_category, options);
	}
	registered_nodes(parent_context: NodeContext, type: string): Dictionary<typeof BaseNodeClass> {
		return this.nodes_register.registered_nodes(parent_context, type);
	}
	in_worker_thread() {
		return false;
	}
	desktop_controller(): any {}
	// notify_scene_loaded(scene: PolyScene) {}

	player_mode(): boolean {
		return false;
	}

	log(...args: any[]) {
		console.log(...args);
	}
	set_env(env: string) {
		this._env = env;
	}
	get env() {
		return this._env;
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
