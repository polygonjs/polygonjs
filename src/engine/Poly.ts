import {BaseNode} from './nodes/_Base';
import {PolyScene} from './scene/PolyScene';
import {RenderersController} from 'src/renderers/RenderersController';
// import {ViewerLoadersManager} from 'src/engine/viewers/LoadersManager';
declare global {
	const POLY: Poly;
}

export class Poly {
	renderers_controller: RenderersController = new RenderersController();
	scenes_by_uuid: Dictionary<PolyScene>;
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
}
