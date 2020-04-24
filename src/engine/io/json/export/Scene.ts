import {PolyScene} from '../../../scene/PolyScene';
// import {JsonExporterVisitor} from './Visitor';
import {CoreString} from '../../../../core/String';
import {NodeJsonExporterData, NodeJsonExporterUIData} from './Node';
import {JsonExportDispatcher} from './Dispatcher';

export interface SceneJsonExporterData {
	properties?: {
		frame: number;
		frame_range: Number2;
		frame_range_locked: Boolean2;
		realtime_state: boolean;
		// fps: number;
		master_camera_node_path: string | null;
	};
	root?: NodeJsonExporterData;
	ui?: NodeJsonExporterUIData;
}

export class SceneJsonExporter {
	private _data: SceneJsonExporterData = {};
	constructor(private _scene: PolyScene) {}

	data(): SceneJsonExporterData {
		this._scene.nodes_controller.reset_node_context_signatures();
		const root_exporter = JsonExportDispatcher.dispatch_node(this._scene.root);
		const nodes_data = root_exporter.data();
		const ui_data = root_exporter.ui_data();

		this._data = {
			// __js_version: this._scene.js_version(),
			properties: {
				// name: this._scene.name(), // this conflicts with saving the name from the admin page
				frame: this._scene.frame || 1,
				frame_range: this._scene.frame_range,
				frame_range_locked: this._scene.time_controller.frame_range_locked,
				realtime_state: this._scene.time_controller.realtime_state,
				// fps: this._scene.time_controller.fps,
				master_camera_node_path: this._scene.cameras_controller.master_camera_node_path,
			},
			root: nodes_data,
			ui: ui_data,
		};

		return this._data;
	}

	static sanitize_string(word: string): string {
		word = word.replace(/'/g, "'"); // escapes ' (used to be with 2 /, but now only one to have Ian's Mediation saved and loaded correctly - but is actually 2 in Code Exporter)
		word = CoreString.escape_line_breaks(word);
		return word;
	}
}
