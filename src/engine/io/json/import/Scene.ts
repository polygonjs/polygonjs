import {PolyScene} from '../../../scene/PolyScene';
// import {JsonImporterVisitor} from './Visitor'
import {SceneJsonExporterData} from '../export/Scene';
import {JsonImportDispatcher} from './Dispatcher';

export class SceneJsonImporter {
	constructor(private _data: SceneJsonExporterData) {}

	static load_data(data: SceneJsonExporterData) {
		const importer = new SceneJsonImporter(data);
		return importer.scene();
	}

	async scene(): Promise<PolyScene> {
		const scene = new PolyScene();
		scene.loading_controller.mark_as_loading();

		// scene.set_js_version(this._data['__js_version'])
		const properties = this._data['properties'];
		if (properties) {
			// scene.set_name(properties['name'])
			scene.set_frame(properties['frame'] || 1);
			const frame_range = properties['frame_range'] || [];
			scene.time_controller.set_frame_range(frame_range[0] || 1, frame_range[1] || 100);
			const frame_range_locked = properties['frame_range_locked'];
			if (frame_range_locked) {
				scene.time_controller.set_frame_range_locked(frame_range_locked[0], frame_range_locked[1]);
			}
			// scene.time_controller.set_fps(properties['fps'] || 30);
			if (properties['master_camera_node_path']) {
				scene.cameras_controller.set_master_camera_node_path(properties['master_camera_node_path']);
			}
		}

		// we block to ensure that nodes will not run their dirty_hooks
		// which would trigger operator_path params to search for nodes that
		// may not exist yet
		scene.cooker.block();

		const importer = JsonImportDispatcher.dispatch_node(scene.root);
		if (this._data['root']) {
			importer.process_data(this._data['root']);
		}
		if (this._data['ui']) {
			importer.process_ui_data(this._data['ui']);
		}

		await scene.loading_controller.mark_as_loaded();
		scene.cooker.unblock();
		// DO NOT wait for cooks here,
		// as a viewer will only be created once everything has cooked
		// which would be a problem for env_map or other nodes relying on the renderer being created
		// await scene.wait_for_cooks_completed();

		return scene;
	}
}
