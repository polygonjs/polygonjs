import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {PerspectiveCameraObjNode} from '../../nodes/obj/PerspectiveCamera';
import {PolyScene} from '../../scene/PolyScene';
import {TimeController} from '../../scene/utils/TimeController';
import {ThreejsViewer} from '../../viewers/Threejs';
import {BaseViewerType} from '../../viewers/_Base';
import {SceneJsonImporter} from '../json/import/Scene';
import {ManifestContent, SceneDataManifestImporter, ProgressCallbackArgs} from '../manifest/import/SceneData';
import {SelfContainedFileName} from '../self_contained/Common';

type ProgressBarUpdateCallback = (progressRatio: number) => void;
type ConfigureSceneCallback = (scene: PolyScene) => void;

interface ScenePlayerImporterOptions {
	domElement: HTMLElement;
	sceneName: string;
	manifest: ManifestContent;
	updateProgressBar?: ProgressBarUpdateCallback;
	configureScene?: ConfigureSceneCallback;
}

const PROGRESS_RATIO = {
	nodes: 0.75,
	sceneData: 0.25,
};

export class ScenePlayerImporter {
	private _scene: PolyScene | undefined;
	private _viewer: BaseViewerType | undefined;
	constructor(private options: ScenePlayerImporterOptions) {}

	static async loadScene(options: ScenePlayerImporterOptions) {
		const importer = new ScenePlayerImporter(options);
		return await importer.loadScene();
	}

	private _onSceneDataLoadProgress(args: ProgressCallbackArgs) {
		const updateProgressBar = this.options.updateProgressBar;
		if (!updateProgressBar) {
			return;
		}
		const ratio = PROGRESS_RATIO.sceneData * (args.count / args.total);
		updateProgressBar(ratio);
		if (ratio >= 1) {
			this._onLoadComplete();
		}
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

	private async _watchNodesProgress(scene: PolyScene) {
		const updateProgressBar = this.options.updateProgressBar;
		if (!updateProgressBar) {
			return;
		}
		const nodes = await scene.root().loadProgress.resolvedNodes();
		const nodesCount = nodes.length;
		if (nodesCount == 0) {
			updateProgressBar(1);
		}
		const callbackName = 'ScenePlayerImporter';
		const cookedNodeIds = new Set<CoreGraphNodeId>();
		for (let node of nodes) {
			const nodeId = node.graphNodeId();
			node.cookController.registerOnCookEnd(callbackName, () => {
				if (!cookedNodeIds.has(nodeId)) {
					cookedNodeIds.add(nodeId);

					const ratio = PROGRESS_RATIO.sceneData + PROGRESS_RATIO.nodes * (cookedNodeIds.size / nodesCount);
					updateProgressBar(ratio);

					node.cookController.deregisterOnCookEnd(callbackName);
				}
			});
		}
	}
	async loadScene() {
		const sceneData = await SceneDataManifestImporter.importSceneData({
			urlPrefix: SelfContainedFileName.CODE_PREFIX,
			manifest: this.options.manifest,
			onProgress: this._onSceneDataLoadProgress.bind(this),
		});

		const importer = new SceneJsonImporter(sceneData);
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
			console.warn('no master camera found, viewer is not mounted');
		} else {
			this._viewer = cameraNode.createViewer({
				element: this.options.domElement,
				viewerProperties: {autoRender: false},
			});
		}
		return this._scene;
	}
}
