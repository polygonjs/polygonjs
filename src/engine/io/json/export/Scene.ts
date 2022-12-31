import {PolyDictionary} from './../../../../types/GlobalTypes';
import {PolyNodeDefinition} from './../../../nodes/utils/poly/PolyNodeDefinition';
import {PolyScene} from '../../../scene/PolyScene';
import {NodeJsonExporterData, NodeJsonExporterUIData, NodeJSONShadersData} from './Node';
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
	shaders?: NodeJSONShadersData;
	embeddedPolyNodes?: PolyDictionary<PolyNodeDefinition>;
}

export class SceneJsonExporter {
	private _data: SceneJsonExporterData = {};
	private dispatcher: JsonExportDispatcher = new JsonExportDispatcher();
	constructor(private _scene: PolyScene) {}

	async data(versions?: Versions): Promise<SceneJsonExporterData> {
		this._scene.nodesController.resetNodeContextSignatures();
		const rootExporter = this.dispatcher.dispatchNode(this._scene.root());
		const nodesData = await rootExporter.data();
		const uiData = rootExporter.uiData();
		const shadersData: NodeJSONShadersData = {};
		await rootExporter.shaders(shadersData);

		this._data = {
			properties: {
				frame: this._scene.frame() || TimeController.START_FRAME,
				maxFrame: this._scene.maxFrame(),
				maxFrameLocked: this._scene.timeController.maxFrameLocked(),
				realtimeState: this._scene.timeController.realtimeState(),
				mainCameraPath: this._scene.camerasController.mainCameraPath(),
				versions: versions,
			},
			root: nodesData,
			ui: uiData,
			shaders: shadersData,
		};

		return this._data;
	}
}
