import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {SceneDataManifestImporter} from '../../index_all';
import {PerspectiveCameraObjNode} from '../../nodes/obj/PerspectiveCamera';
import {PolyScene} from '../../scene/PolyScene';
import {TimeController} from '../../scene/utils/TimeController';
import {ThreejsViewer} from '../../viewers/Threejs';
import {BaseViewerType} from '../../viewers/_Base';
// import {AssetsPreloader} from '../assets/PreLoader';
import {PROGRESS_RATIO} from '../common/Progress';
import {SceneJsonExporterData} from '../json/export/Scene';
import {SceneJsonImporter} from '../json/import/Scene';
import {ManifestContent} from '../manifest/import/SceneData';

type ProgressBarUpdateCallback = (progressRatio: number) => void;
type ConfigureSceneCallback = (scene: PolyScene) => void;

export interface LoadSceneOptions {
	onProgress?: ProgressBarUpdateCallback;
}
export type LoadScene = (options: LoadSceneOptions) => void;

interface ImportCommonOptions extends LoadSceneOptions {
	domElement: HTMLElement;
	sceneName: string;
	configureScene?: ConfigureSceneCallback;
	assetUrls?: string[];
}

export interface SceneDataImportOptions extends ImportCommonOptions {
	sceneData: SceneJsonExporterData;
}
export type LoadSceneData = (options: SceneDataImportOptions) => void;

interface ManifestImportOptions extends ImportCommonOptions {
	manifest: {
		content: ManifestContent;
		urlPrefix?: string;
	};
}

// type PreloadPromises = [Promise<void>, Promise<SceneJsonExporterData>];
type PreloadPromises = [Promise<SceneJsonExporterData>];

export class ScenePlayerImporter {
	private _scene: PolyScene | undefined;
	private _viewer: BaseViewerType | undefined;
	constructor(private options: SceneDataImportOptions) {}

	static async loadSceneData(options: SceneDataImportOptions) {
		const importer = new ScenePlayerImporter(options);
		return await importer.loadScene();
	}
	static async loadManifest(options: ManifestImportOptions) {
		// const promises: PreloadPromises = [AssetsPreloader.fetchAssets(options), this._fetchSceneData(options)];
		const promises: PreloadPromises = [this._fetchSceneData(options)];
		const results = await Promise.all(promises);
		const sceneData: SceneJsonExporterData = results[1];

		return await this._loadSceneData(options, sceneData);
	}
	private static async _fetchSceneData(options: ManifestImportOptions) {
		const sceneData = await SceneDataManifestImporter.importSceneData({
			urlPrefix: options.manifest.urlPrefix,
			manifest: options.manifest.content,
			onProgress: options.onProgress,
		});
		return sceneData;
	}
	private static async _loadSceneData(options: ManifestImportOptions, sceneData: SceneJsonExporterData) {
		const scene = await ScenePlayerImporter.loadSceneData({
			domElement: options.domElement,
			sceneName: options.sceneName,
			onProgress: options.onProgress,
			configureScene: options.configureScene,
			sceneData,
		});
		return scene;
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
		const progressRatio = PROGRESS_RATIO.nodes;

		const onProgress = (ratio: number) => {
			if (this.options.onProgress) {
				this.options.onProgress(progressRatio.start + progressRatio.mult * ratio);
			}
		};
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
			// we force nodes to compute
			// in case they do not have a display flag on, or are not connected
			// as it would get the progress bar stuck
			node.compute();
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
