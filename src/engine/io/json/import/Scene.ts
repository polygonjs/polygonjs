import {PolyScene} from '../../../scene/PolyScene';
// import {JsonImporterVisitor} from './Visitor'
import {SceneJsonExporterData} from '../export/Scene';
import {JsonImportDispatcher} from './Dispatcher';
import {ImportReport} from './ImportReport';
import {OperationsComposerSopNode} from '../../../nodes/sop/OperationsComposer';

export class SceneJsonImporter {
	public readonly report = new ImportReport(this);
	private _base_operations_composer_nodes_with_resolve_required: OperationsComposerSopNode[] | undefined;
	constructor(private _data: SceneJsonExporterData) {}

	static async loadData(data: SceneJsonExporterData) {
		const importer = new SceneJsonImporter(data);
		return await importer.scene();
	}

	async scene(): Promise<PolyScene> {
		const scene = new PolyScene();
		scene.loadingController.markAsLoading();

		// scene.set_js_version(this._data['__js_version'])
		const properties = this._data['properties'];
		if (properties) {
			// scene.setName(properties['name'])
			const frame_range = properties['frame_range'] || [];
			scene.timeController.setFrameRange(frame_range[0] || 1, frame_range[1] || 100);
			const frameRangeLocked = properties['frameRangeLocked'];
			if (frameRangeLocked) {
				scene.timeController.setFrameRange_locked(frameRangeLocked[0], frameRangeLocked[1]);
			}
			const realtimeState = properties['realtimeState'];
			if (realtimeState != null) {
				scene.timeController.set_realtimeState(realtimeState);
			}
			// set frame after the range has been set, to avoid clamping
			scene.setFrame(properties['frame'] || 1);

			// scene.time_controller.set_fps(properties['fps'] || 30);
			if (properties['masterCameraNodePath']) {
				scene.camerasController.setMasterCameraNodePath(properties['masterCameraNodePath']);
			}
		}

		// we block to ensure that nodes will not run their dirty_hooks
		// which would trigger operator_path params to search for nodes that
		// may not exist yet
		scene.cooker.block();

		this._base_operations_composer_nodes_with_resolve_required = undefined;

		const importer = JsonImportDispatcher.dispatch_node(scene.root);
		if (this._data['root']) {
			importer.process_data(this, this._data['root']);
		}
		if (this._data['ui']) {
			importer.process_ui_data(this, this._data['ui']);
		}

		this._resolve_operation_containers_with_path_param_resolve();

		await scene.loadingController.markAsLoaded();
		scene.cooker.unblock();
		// DO NOT wait for cooks here,
		// as a viewer will only be created once everything has cooked
		// which would be a problem for envMap or other nodes relying on the renderer being created
		// await scene.waitForCooksCompleted();

		return scene;
	}

	//
	//
	// OPERATION CONTAINER RESOLVE
	//
	//
	add_operations_composer_node_with_path_param_resolve_required(operations_composer_node: OperationsComposerSopNode) {
		if (!this._base_operations_composer_nodes_with_resolve_required) {
			this._base_operations_composer_nodes_with_resolve_required = [];
		}
		this._base_operations_composer_nodes_with_resolve_required.push(operations_composer_node);
	}
	private _resolve_operation_containers_with_path_param_resolve() {
		if (!this._base_operations_composer_nodes_with_resolve_required) {
			return;
		}
		for (let operations_composer_node of this._base_operations_composer_nodes_with_resolve_required) {
			operations_composer_node.resolve_operation_containers_path_params();
		}
	}
}
