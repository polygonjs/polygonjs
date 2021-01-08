import {Number2, Boolean2} from '../../../../types/GlobalTypes';
import {PolyScene} from '../../../scene/PolyScene';
import {CoreString} from '../../../../core/String';
import {NodeJsonExporterData, NodeJsonExporterUIData} from './Node';
import {JsonExportDispatcher} from './Dispatcher';

export interface SceneJsonExporterDataProperties {
	frame: number;
	frame_range: Number2;
	frameRangeLocked: Boolean2;
	realtimeState: boolean;
	// fps: number;
	masterCameraNodePath: string | null;
}
export interface SceneJsonExporterData {
	properties?: SceneJsonExporterDataProperties;
	root?: NodeJsonExporterData;
	ui?: NodeJsonExporterUIData;
}

export class SceneJsonExporter {
	private _data: SceneJsonExporterData = {};
	constructor(private _scene: PolyScene) {}

	data(): SceneJsonExporterData {
		this._scene.nodesController.reset_node_context_signatures();
		const root_exporter = JsonExportDispatcher.dispatch_node(this._scene.root);
		const nodes_data = root_exporter.data();
		const ui_data = root_exporter.ui_data();

		this._data = {
			// __js_version: this._scene.js_version(),
			properties: {
				// name: this._scene.name(), // this conflicts with saving the name from the admin page
				frame: this._scene.frame || 1,
				frame_range: this._scene.frame_range,
				frameRangeLocked: this._scene.timeController.frameRangeLocked,
				realtimeState: this._scene.timeController.realtimeState,
				// fps: this._scene.time_controller.fps,
				masterCameraNodePath: this._scene.camerasController.masterCameraNodePath,
			},
			root: nodes_data,
			ui: ui_data,
		};

		return this._data;
	}

	static sanitize_string(word: string): string {
		word = word.replace(/'/g, "'"); // escapes ' (used to be with 2 /, but now only one to have Ian's Mediation saved and loaded correctly - but is actually 2 in Code Exporter)
		word = CoreString.escapeLineBreaks(word);
		return word;
	}
}
