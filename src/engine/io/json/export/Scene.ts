import {PolyScene} from '../../../scene/PolyScene';
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
	mainCameraPath?: string | null;
	mainCameraNodePath?: string | null;
	versions?: Versions;
}
export interface SceneJsonExporterData {
	properties?: SceneJsonExporterDataProperties;
	root?: NodeJsonExporterData;
	ui?: NodeJsonExporterUIData;
}

export class SceneJsonExporter {
	private _data: SceneJsonExporterData = {};
	private dispatcher: JsonExportDispatcher = new JsonExportDispatcher();
	constructor(private _scene: PolyScene) {}

	data(versions?: Versions): SceneJsonExporterData {
		this._scene.nodesController.resetNodeContextSignatures();
		const root_exporter = this.dispatcher.dispatchNode(this._scene.root());
		const nodes_data = root_exporter.data();
		const ui_data = root_exporter.uiData();

		this._data = {
			properties: {
				frame: this._scene.frame() || TimeController.START_FRAME,
				maxFrame: this._scene.maxFrame(),
				maxFrameLocked: this._scene.timeController.maxFrameLocked(),
				realtimeState: this._scene.timeController.realtimeState(),
				mainCameraPath: this._scene.camerasController.mainCameraPath(),
				versions: versions,
			},
			root: nodes_data,
			ui: ui_data,
		};

		return this._data;
	}
}
