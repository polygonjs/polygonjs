import {PolyScene} from '../../../scene/PolyScene';
import {CoreString} from '../../../../core/String';
import {NodeJsonExporterData, NodeJsonExporterUIData} from './Node';
import {JsonExportDispatcher} from './Dispatcher';
import {TimeController} from '../../../scene/utils/TimeController';

interface Versions {
	polygonjs: string;
}
export interface SceneJsonExporterDataProperties {
	frame: number;
	maxFrame: number;
	maxFrameLocked: boolean;
	realtimeState: boolean;
	mainCameraNodePath: string | null;
	versions?: Versions;
}
export interface SceneJsonExporterData {
	properties?: SceneJsonExporterDataProperties;
	root?: NodeJsonExporterData;
	ui?: NodeJsonExporterUIData;
}

export class SceneJsonExporter {
	private _data: SceneJsonExporterData = {};
	constructor(private _scene: PolyScene) {}

	data(versions?: Versions): SceneJsonExporterData {
		this._scene.nodesController.reset_node_context_signatures();
		const root_exporter = JsonExportDispatcher.dispatch_node(this._scene.root());
		const nodes_data = root_exporter.data();
		const ui_data = root_exporter.ui_data();

		this._data = {
			properties: {
				frame: this._scene.frame() || TimeController.START_FRAME,
				maxFrame: this._scene.maxFrame(),
				maxFrameLocked: this._scene.timeController.maxFrameLocked(),
				realtimeState: this._scene.timeController.realtimeState(),
				mainCameraNodePath: this._scene.camerasController.mainCameraNodePath(),
				versions: versions,
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
