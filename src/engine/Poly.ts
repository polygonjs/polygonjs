import {BaseNodeClass} from './nodes/_Base';
import {PolyScene} from './scene/PolyScene';
import {RenderersController} from './poly/RenderersController';
import {NodesRegister, RegisterOptions, BaseNodeConstructor} from './poly/NodesRegister';
import {NodeContext} from './poly/NodeContext';
// import {ViewerLoadersManager} from '/viewers/LoadersManager';

export class Poly {
	static _instance: Poly | undefined;
	renderers_controller: RenderersController = new RenderersController();
	nodes_register: NodesRegister = new NodesRegister();

	scenes_by_uuid: Dictionary<PolyScene> = {};
	_env: string | undefined;
	// public viewer_loaders_manager: ViewerLoadersManager = new ViewerLoadersManager();

	static instance() {
		return (this._instance = this._instance || new Poly());
	}
	private constructor() {}

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
