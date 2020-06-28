import {PolyScene} from '../../../scene/PolyScene';
// import {JsonImporterVisitor} from './Visitor'
import {SceneJsonExporterData} from '../export/Scene';
import {JsonImportDispatcher} from './Dispatcher';
import {ImportReport} from './ImportReport';

export class SceneJsonImporter {
	public readonly report = new ImportReport(this);
	constructor(private _data: SceneJsonExporterData) {}

	static async load_data(data: SceneJsonExporterData) {
		const importer = new SceneJsonImporter(data);
		return await importer.scene();
	}

	async scene(): Promise<PolyScene> {
		const scene = new PolyScene();
		scene.loading_controller.mark_as_loading();

		// scene.set_js_version(this._data['__js_version'])
		const properties = this._data['properties'];
		if (properties) {
			// scene.set_name(properties['name'])
			const frame_range = properties['frame_range'] || [];
			scene.time_controller.set_frame_range(frame_range[0] || 1, frame_range[1] || 100);
			const frame_range_locked = properties['frame_range_locked'];
			if (frame_range_locked) {
				scene.time_controller.set_frame_range_locked(frame_range_locked[0], frame_range_locked[1]);
			}
			const realtime_state = properties['realtime_state'];
			if (realtime_state != null) {
				scene.time_controller.set_realtime_state(realtime_state);
			}
			// set frame after the range has been set, to avoid clamping
			scene.set_frame(properties['frame'] || 1);

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
			importer.process_data(this, this._data['root']);
		}
		if (this._data['ui']) {
			importer.process_ui_data(this, this._data['ui']);
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
