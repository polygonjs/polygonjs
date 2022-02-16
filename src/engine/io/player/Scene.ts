import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
// import {SceneDataManifestImporter} from '../manifest/import/SceneData';
import {PerspectiveCameraObjNode} from '../../nodes/obj/PerspectiveCamera';
import {PolyScene} from '../../scene/PolyScene';
import {TimeController} from '../../scene/utils/TimeController';
import {BaseViewerType} from '../../viewers/_Base';
// import {AssetsPreloader} from '../assets/PreLoader';
import {PROGRESS_RATIO} from '../common/Progress';
import {SceneJsonExporterData} from '../json/export/Scene';
import {SceneJsonImporter} from '../json/import/Scene';
// import {ManifestContent} from '../manifest/import/SceneData';

type ProgressBarUpdateCallback = (progressRatio: number) => void;
type ConfigureSceneCallback = (scene: PolyScene) => void;

export enum EventName {
	VIEWER_MOUNTED = 'POLYViewerMounted',
	SCENE_READY = 'POLYSceneReady',
}

export interface LoadSceneOptions {
	onProgress?: ProgressBarUpdateCallback;
}
export type LoadScene = (options: LoadSceneOptions) => void;

interface ImportCommonOptions extends LoadSceneOptions {
	domElement?: HTMLElement;
	sceneName: string;
	configureScene?: ConfigureSceneCallback;
	assetUrls?: string[];
}

export interface SceneDataImportOptions extends ImportCommonOptions {
	sceneData: SceneJsonExporterData;
	assetsRoot: string;
	autoPlay?: boolean;
}
export type LoadSceneData = (options: SceneDataImportOptions) => void;
export interface SceneDataImportOptionsOnly {
	sceneData: SceneJsonExporterData;
	assetsRoot: string;
}

// interface ManifestImportOptions extends ImportCommonOptions {
// 	manifest: {
// 		content: ManifestContent;
// 		urlPrefix?: string;
// 	};
// }

// type PreloadPromises = [Promise<void>, Promise<SceneJsonExporterData>];
// type PreloadPromises = [Promise<SceneJsonExporterData>];

export class ScenePlayerImporter {
	private _scene: PolyScene | undefined;
	private _viewer: BaseViewerType | undefined;
	constructor(private options: SceneDataImportOptions) {}

	static async loadSceneData(options: SceneDataImportOptions) {
		const importer = new ScenePlayerImporter(options);
		const scene = await importer.loadScene();
		const viewer = importer._viewer;
		return {scene, viewer};
	}
	// static async loadManifest(options: ManifestImportOptions, assetsRoot: string) {
	// 	// const promises: PreloadPromises = [AssetsPreloader.fetchAssets(options), this._fetchSceneData(options)];
	// 	const promises: PreloadPromises = [this._fetchSceneData(options)];
	// 	const results = await Promise.all(promises);
	// 	const sceneData: SceneJsonExporterData = results[1];

	// 	return await this._loadSceneData(options, {sceneData, assetsRoot});
	// }
	// private static async _fetchSceneData(options: ManifestImportOptions) {
	// 	const sceneData = await SceneDataManifestImporter.importSceneData({
	// 		urlPrefix: options.manifest.urlPrefix,
	// 		manifest: options.manifest.content,
	// 		onProgress: options.onProgress,
	// 	});
	// 	return sceneData;
	// }
	// private static async _loadSceneData(
	// 	manifestOptions: ManifestImportOptions,
	// 	sceneDataAptions: SceneDataImportOptionsOnly
	// ) {
	// 	const scene = await ScenePlayerImporter.loadSceneData({
	// 		domElement: manifestOptions.domElement,
	// 		sceneName: manifestOptions.sceneName,
	// 		onProgress: manifestOptions.onProgress,
	// 		configureScene: manifestOptions.configureScene,
	// 		sceneData: sceneDataAptions.sceneData,
	// 		assetsRoot: sceneDataAptions.assetsRoot,
	// 	});
	// 	return scene;
	// }

	private _onLoadCompleteCalled = false;
	private async _onLoadComplete() {
		if (this._onLoadCompleteCalled == true) {
			return;
		}
		this._onLoadCompleteCalled = true;
		if (this._viewer) {
			this._viewer.markAsReady();
		}
		if (this._scene) {
			await this._scene.cookController.waitForCooksCompleted();
			this._scene.setFrame(TimeController.START_FRAME);
			// we need to wait for node cooks to be completed
			// otherwise, the play would be stale
			if (this.options.autoPlay != false) {
				this._scene.play();
			}
			this._dispatchEvent(EventName.SCENE_READY);
		}
	}
	private _onNodesCookProgress(ratio: number) {
		const onProgress = (ratio: number) => {
			if (this.options.onProgress) {
				this.options.onProgress(progressRatio.start + progressRatio.mult * ratio);
			}
		};
		const progressRatio = PROGRESS_RATIO.nodes;
		// make sure to always call onProgress
		// even if ratio==1
		// as there may still be important instructions
		// in the user-defined options.onProgress
		onProgress(ratio);

		if (ratio >= 1) {
			this._onLoadComplete();
		}
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

		// mount
		const cameraNode = this._scene.mainCameraNode() as PerspectiveCameraObjNode;
		if (!cameraNode) {
			console.warn('no main camera found, viewer is not mounted');
		} else {
			const domElement = this.options.domElement;
			this._viewer = cameraNode.createViewer({
				element: domElement,
				viewerProperties: {autoRender: false},
			});
			this._dispatchEvent(EventName.VIEWER_MOUNTED);
		}
		// watch progress of selected nodes
		this._watchNodesProgress(this._scene);

		return this._scene;
	}
	private _dispatchEvent(eventName: EventName) {
		const elements = [this.options.domElement, document];
		const createEvent = (customEventName: string) => {
			return new CustomEvent(customEventName, {
				detail: {
					scene: this._scene,
					viewer: this._viewer,
				},
			});
		};
		for (let element of elements) {
			if (element) {
				element.dispatchEvent(createEvent(eventName));
				if (this._scene) {
					element.dispatchEvent(createEvent(`${eventName}-${this._scene.name()}`));
				}
			}
		}
	}
}
