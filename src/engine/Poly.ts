import {BaseNode} from './nodes/_Base';
import {PolyScene} from './scene/PolyScene';
import {RenderersController} from 'src/renderers/RenderersController';
// import {ViewerLoadersManager} from 'src/engine/viewers/LoadersManager';

export class Poly {
	renderers_controller: RenderersController = new RenderersController();
	scenes_by_uuid: Dictionary<PolyScene>;
	_env: string;
	// public viewer_loaders_manager: ViewerLoadersManager = new ViewerLoadersManager();

	in_worker_thread() {
		return false;
	}
	desktop_controller(): any {}
	notify_scene_loaded(scene: PolyScene) {}

	player_mode(): boolean {
		return false;
	}
	registered_nodes(test: string, test2: string): Dictionary<typeof BaseNode> {
		return {};
	}

	log(message: string) {
		console.log(message);
	}
	set_env(env: string) {
		this._env = env;
	}
	get env() {
		return this._env;
	}
}

declare global {
	const POLY: Poly;
}

declare global {
	interface Window {
		POLY: Poly;
	}
}
// make sure not to have library: 'POLY' in webpack for this to work
window.POLY = new Poly();
