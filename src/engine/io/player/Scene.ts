import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {PerspectiveCameraObjNode} from '../../nodes/obj/PerspectiveCamera';
import {PolyScene} from '../../scene/PolyScene';
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
	sceneCodeManifestUrl: string;
	progressBarUpdateCallback: ProgressBarUpdateCallback;
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
	private _onSceneDataLoadProgress(args: ProgressCallbackArgs) {
		const ratio = PROGRESS_RATIO.sceneData * (args.count / args.total);
		this.options.progressBarUpdateCallback(ratio);
		if (ratio >= 1) {
			if (this._viewer) {
				const threejsViewer = this._viewer as ThreejsViewer;
				if (threejsViewer.setAutoRender) {
					threejsViewer.setAutoRender(true);
				}
			}
		}
	}
	private async _watchNodesProgress(scene: PolyScene) {
		const nodes = await scene.root().loadProgress.resolvedNodes();
		console.log('_watchNodesProgress', nodes);
		const nodesCount = nodes.length;
		const callbackName = 'ScenePlayerImporter';
		const cookedNodeIds = new Set<CoreGraphNodeId>();
		for (let node of nodes) {
			const nodeId = node.graphNodeId();
			node.cookController.registerOnCookEnd(callbackName, () => {
				if (!cookedNodeIds.has(nodeId)) {
					cookedNodeIds.add(nodeId);

					const ratio = PROGRESS_RATIO.sceneData + PROGRESS_RATIO.nodes * (cookedNodeIds.size / nodesCount);
					console.log('nodes ratio', ratio);
					this.options.progressBarUpdateCallback(ratio);

					node.cookController.deregisterOnCookEnd(callbackName);
				}
			});
		}
	}
	async loadScene() {
		const response = await fetch(this.options.sceneCodeManifestUrl);
		const manifestContent = (await response.json()) as ManifestContent;

		const sceneData = await SceneDataManifestImporter.importSceneData({
			urlPrefix: SelfContainedFileName.CODE_PREFIX,
			manifest: manifestContent,
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
			console.warn('no master camera found');
			return;
		}
		this._viewer = cameraNode.createViewer({
			element: this.options.domElement,
			viewerProperties: {autoRender: false},
		});
		this._scene.play();
		return this._scene;
	}
}
