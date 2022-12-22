import {CoreFeaturesController} from './../../../../core/FeaturesController';
import {NodeJsonExporterData} from './../export/Node';
import {BaseNodeType} from './../../../nodes/_Base';
import {NodeContext} from './../../../poly/NodeContext';
import {PolyNodeController} from './../../../nodes/utils/poly/PolyNodeController';
import {PolyScene} from '../../../scene/PolyScene';
// import {JsonImporterVisitor} from './Visitor'
import {SceneJsonExporterData} from '../export/Scene';
import {JsonImportDispatcher} from './Dispatcher';
import {ImportReport} from './ImportReport';
import {OperationsComposerSopNode} from '../../../nodes/sop/OperationsComposer';
import {TimeController} from '../../../scene/utils/TimeController';
import {ParamJsonImporter} from './Param';
import {NodeCreateOptions} from '../../../nodes/utils/hierarchy/ChildrenController';
import {ROOT_NODE_NAME} from '../../../nodes/manager/Root';
export type ConfigureSceneCallback = (scene: PolyScene) => void;
export type NodeCookWatchCallback = (scene: PolyScene) => void;

interface SceneJSONImporterOptions {
	sceneName?: string;
	configureScene?: ConfigureSceneCallback;
	nodeCookWatcher?: NodeCookWatchCallback;
	measurePerformanceOnLoad?: boolean;
}

interface MigrateHelper {
	migrateNodeType: (parentNode: BaseNodeType, nodeData: NodeJsonExporterData) => string;
	migrateParams: (parentNode: BaseNodeType, nodeData: NodeJsonExporterData) => void;
}

export class SceneJsonImporter {
	public readonly report = new ImportReport(this);
	private _base_operations_composer_nodes_with_resolve_required: OperationsComposerSopNode[] | undefined;
	constructor(private _data: SceneJsonExporterData, private _options?: SceneJSONImporterOptions) {}

	static async loadData(data: SceneJsonExporterData, options?: SceneJSONImporterOptions) {
		const importer = new SceneJsonImporter(data, options);
		return await importer.scene();
	}
	private _migrateHelper: MigrateHelper | undefined;
	setMigrateHelper(migrateHelper: MigrateHelper) {
		this._migrateHelper = migrateHelper;
	}
	migrateHelper() {
		return this._migrateHelper;
	}
	oldPolygonjsSceneVersion() {
		const properties = this._data['properties'];
		if (properties) {
			return properties.versions?.polygonjs;
		}
	}

	scene(): PolyScene {
		if (CoreFeaturesController.debugLoadProgress()) {
			console.log(`polygonjs version:${this.oldPolygonjsSceneVersion()}`);
		}
		const rootData = this._data['root']!;
		const paramsInitValueOverrides = ParamJsonImporter.non_spare_params_data_value(rootData['params']);
		const nodeCreateOptions: NodeCreateOptions = {
			paramsInitValueOverrides,
			nodeName: ROOT_NODE_NAME,
		};

		const embeddedPolyNodes = this._data.embeddedPolyNodes;
		if (embeddedPolyNodes) {
			const keys = Object.keys(embeddedPolyNodes);
			for (let key of keys) {
				const elements = key.split('/');
				const node_context = elements[0] as NodeContext;
				const node_type = elements[1];
				const data = embeddedPolyNodes[key];
				PolyNodeController.createNodeClassAndRegister({node_context, node_type, data});
			}
		}

		const scene = new PolyScene({root: nodeCreateOptions});
		if (this._options) {
			if (this._options.sceneName) {
				scene.setName(this._options.sceneName);
			}
			if (this._options.measurePerformanceOnLoad == true) {
				scene.performance.start();
			}
		}
		scene.loadingController.markAsLoading();

		// scene.set_js_version(this._data['__js_version'])
		const properties = this._data['properties'];
		if (properties) {
			// properties.versions?.polygonjs
			// scene.setName(properties['name'])
			const maxFrame = properties['maxFrame'] || 600;
			scene.timeController.setMaxFrame(maxFrame);
			const maxFrameLocked = properties['maxFrameLocked'];
			if (maxFrameLocked) {
				scene.timeController.setMaxFrameLocked(maxFrameLocked);
			}
			const realtimeState = properties['realtimeState'];
			if (realtimeState != null) {
				scene.timeController.setRealtimeState(realtimeState);
			}
			// set frame after the range has been set, to avoid clamping
			scene.setFrame(properties['frame'] || TimeController.START_FRAME);

			// scene.time_controller.set_fps(properties['fps'] || 30);
			const mainCameraPath = properties['mainCameraNodePath'] || properties['mainCameraPath'];
			if (mainCameraPath) {
				scene.camerasController.setMainCameraPath(mainCameraPath);
			}
		}

		// we block to ensure that nodes will not run their dirty_hooks
		// which would trigger operator_path params to search for nodes that
		// may not exist yet
		scene.cooker.block();

		this._base_operations_composer_nodes_with_resolve_required = undefined;

		const dispatcher = new JsonImportDispatcher();
		const importer = dispatcher.dispatchNode(scene.root());

		if (rootData) {
			importer.process_data(this, rootData);
		}
		const uiData = this._data['ui'];
		if (uiData) {
			importer.process_ui_data(this, uiData);
		}

		this._resolve_operation_containers_with_path_param_resolve();

		if (this._options) {
			if (this._options.nodeCookWatcher) {
				this._options.nodeCookWatcher(scene);
			}
			if (this._options.configureScene) {
				// make sure configureScene is called after the setName above
				this._options.configureScene(scene);
			}
		}
		scene.loadingController.markAsLoaded();
		scene.cooker.unblock();

		// DO NOT wait for cooks here,
		// as a viewer will only be created once everything has cooked
		// which would be a problem for envMap or other nodes relying on the renderer being created
		// await scene.waitForCooksCompleted();

		return scene;
	}
	shadersData() {
		return this._data['shaders'];
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
			operations_composer_node.resolveOperationContainersPathParams();
		}
	}
}
