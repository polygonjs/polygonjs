import {SetUtils} from '../../../core/SetUtils';
// import {SceneDataManifestImporter} from '../manifest/import/SceneData';
import {PerspectiveCameraObjNode} from '../../nodes/obj/PerspectiveCamera';
import {BaseNodeType} from '../../nodes/_Base';
import {PolyScene} from '../../scene/PolyScene';
import {TimeController} from '../../scene/utils/TimeController';
import {BaseViewerType} from '../../viewers/_Base';
import {PolyEventsDispatcher, PolyEventName} from '../common/EventsDispatcher';
// import {AssetsPreloader} from '../assets/PreLoader';
import {PROGRESS_RATIO} from '../common/Progress';
import {SceneJsonExporterData} from '../json/export/Scene';
import {SceneJsonImporter, ConfigureSceneCallback} from '../json/import/Scene';
// import {ManifestContent} from '../manifest/import/SceneData';

interface OnProgressArguments {
	scene: PolyScene;
	triggerNode?: BaseNodeType;
	cookedNodes: BaseNodeType[];
	remainingNodes: BaseNodeType[];
}

type ProgressBarUpdateCallback = (progressRatio: number, args: OnProgressArguments) => void;

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
	// assetsRoot: string;
	autoPlay?: boolean;
}
export type LoadSceneData = (options: SceneDataImportOptions) => void;
export interface SceneDataImportOptionsOnly {
	sceneData: SceneJsonExporterData;
	// assetsRoot: string;
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
	private async _onLoadComplete(scene: PolyScene) {
		if (this._onLoadCompleteCalled == true) {
			return;
		}
		this._onLoadCompleteCalled = true;
		if (this._viewer) {
			this._markViewerAsReady(this._viewer);
		}
		await this._markSceneAsReady(scene);
	}
	private _viewerMarkedAsReady = false;
	private _markViewerAsReady(viewer: BaseViewerType) {
		if (this._viewerMarkedAsReady) {
			return;
		}
		this._viewerMarkedAsReady = true;
		viewer.markAsReady();
	}
	private _sceneMarkedAsReady = false;
	private async _markSceneAsReady(scene: PolyScene) {
		if (this._sceneMarkedAsReady) {
			return;
		}
		this._sceneMarkedAsReady = true;
		await scene.cookController.waitForCooksCompleted();
		scene.setFrame(TimeController.START_FRAME);
		// we need to wait for node cooks to be completed
		// otherwise, the play would be stale
		if (this.options.autoPlay != false) {
			scene.play();
		}
		this._dispatchEvent(PolyEventName.SCENE_READY);
	}

	private _onNodesCookProgress(nodesCookProgress: number, args: OnProgressArguments) {
		const progressRatio = PROGRESS_RATIO.nodes;
		const onProgress = (_ratio: number, args: OnProgressArguments) => {
			const progress = progressRatio.start + progressRatio.mult * _ratio;
			if (this.options.onProgress) {
				this.options.onProgress(progress, args);
			}
			PolyEventsDispatcher.dispatchProgressEvent(progress, this._scene?.name());
		};
		// make sure to always call onProgress
		// even if ratio==1
		// as there may still be important instructions
		// in the user-defined options.onProgress
		onProgress(nodesCookProgress, args);

		if (nodesCookProgress >= 1) {
			this._onLoadComplete(args.scene);
		}
	}

	private async _watchNodesProgress(scene: PolyScene) {
		const nodes = await scene.root().loadProgress.resolvedNodes();
		const nodesCount = nodes.length;
		if (nodesCount == 0) {
			this._onNodesCookProgress(1, {scene, triggerNode: undefined, cookedNodes: [], remainingNodes: []});
		}
		const remainingNodes = SetUtils.fromArray(nodes);
		const cookedNodes = new Set<BaseNodeType>();
		const callbackName = 'ScenePlayerImporter';
		for (let node of nodes) {
			// we force nodes to compute
			// in case they do not have a display flag on, or are not connected
			// as it would get the progress bar stuck
			node.compute();
			node.cookController.registerOnCookEnd(callbackName, () => {
				if (!cookedNodes.has(node)) {
					cookedNodes.add(node);
					remainingNodes.delete(node);

					const nodesCookProgress = cookedNodes.size / nodesCount;
					this._onNodesCookProgress(nodesCookProgress, {
						scene,
						triggerNode: node,
						cookedNodes: SetUtils.toArray(cookedNodes),
						remainingNodes: SetUtils.toArray(remainingNodes),
					});

					node.cookController.deregisterOnCookEnd(callbackName);
				}
			});
		}
	}
	async loadScene() {
		const configureScene = this.options.configureScene;
		const importer = new SceneJsonImporter(this.options.sceneData, {
			sceneName: this.options.sceneName,
			configureScene,
			nodeCookWatcher: this._watchNodesProgress.bind(this),
		});
		this._scene = await importer.scene();

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
			// if the scene is marked as ready, and thew viewer hasn't been marked as ready yet,
			// which can happen if there are no nodes to check the progress of,
			// then the viewer should be marked as ready now
			if (this._sceneMarkedAsReady == true) {
				this._markViewerAsReady(this._viewer);
			}

			this._dispatchEvent(PolyEventName.VIEWER_MOUNTED);
		}

		return this._scene;
	}
	private _dispatchEvent(eventName: PolyEventName) {
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
