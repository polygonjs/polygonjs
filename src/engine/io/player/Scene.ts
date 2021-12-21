import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {PerspectiveCameraObjNode} from '../../nodes/obj/PerspectiveCamera';
import {PolyScene} from '../../scene/PolyScene';
import {TimeController} from '../../scene/utils/TimeController';
import {ThreejsViewer} from '../../viewers/Threejs';
import {BaseViewerType} from '../../viewers/_Base';
import {SceneJsonExporterData} from '../json/export/Scene';
import {SceneJsonImporter} from '../json/import/Scene';

type ProgressBarUpdateCallback = (progressRatio: number) => void;
type ConfigureSceneCallback = (scene: PolyScene) => void;

export interface LoadSceneOptions {
	sceneData: SceneJsonExporterData;
	onProgress?: ProgressBarUpdateCallback;
}
export type LoadScene = (options: LoadSceneOptions) => void;

interface ScenePlayerImporterOptions extends LoadSceneOptions {
	domElement: HTMLElement;
	sceneName: string;
	sceneData: SceneJsonExporterData;
	configureScene?: ConfigureSceneCallback;
}

export class ScenePlayerImporter {
	private _scene: PolyScene | undefined;
	private _viewer: BaseViewerType | undefined;
	constructor(private options: ScenePlayerImporterOptions) {}

	static async loadScene(options: ScenePlayerImporterOptions) {
		const importer = new ScenePlayerImporter(options);
		return await importer.loadScene();
	}

	private _onLoadComplete() {
		if (this._viewer) {
			const threejsViewer = this._viewer as ThreejsViewer;
			if (threejsViewer.setAutoRender) {
				threejsViewer.setAutoRender(true);
			}
		}
		if (this._scene) {
			this._scene.setFrame(TimeController.START_FRAME);
			this._scene.play();
		}
	}
	private _onNodesCookProgress(ratio: number) {
		if (ratio >= 1) {
			this._onLoadComplete();
		}

		const onProgress = this.options.onProgress;
		if (!onProgress) {
			return;
		}
		onProgress(ratio);
	}

	private async _watchNodesProgress(scene: PolyScene) {
		const nodes = await scene.root().loadProgress.resolvedNodes();
		const nodesCount = nodes.length;
		if (nodesCount == 0) {
			this._onNodesCookProgress(1);
		}
		const callbackName = 'ScenePlayerImporter';
		const cookedNodeIds = new Set<CoreGraphNodeId>();
		for (let node of nodes) {
			const nodeId = node.graphNodeId();
			node.cookController.registerOnCookEnd(callbackName, () => {
				if (!cookedNodeIds.has(nodeId)) {
					cookedNodeIds.add(nodeId);

					const ratio = cookedNodeIds.size / nodesCount;
					this._onNodesCookProgress(ratio);

					node.cookController.deregisterOnCookEnd(callbackName);
				}
			});
		}
	}
	async loadScene() {
		const importer = new SceneJsonImporter(this.options.sceneData);
		this._scene = await importer.scene();

		// set name and configureScene after
		this._scene.setName(this.options.sceneName);
		const configureScene = this.options.configureScene;
		if (configureScene) {
			configureScene(this._scene);
		}
		// watch progress of selected nodes
		this._watchNodesProgress(this._scene);

		// mount
		const cameraNode = this._scene.mainCameraNode() as PerspectiveCameraObjNode;
		if (!cameraNode) {
			console.warn('no main camera found, viewer is not mounted');
		} else {
			this._viewer = cameraNode.createViewer({
				element: this.options.domElement,
				viewerProperties: {autoRender: false},
			});
		}
		return this._scene;
	}
}
