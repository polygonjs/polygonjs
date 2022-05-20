import {WebGLRenderer} from 'three';
import {CoreType} from '../../../core/Type';
import {OnProgressArguments, OnProgressUpdateCallback} from '../../nodes/manager/utils/Scene/LoadProgress';
// import {BaseNodeType} from '../../nodes/_Base';
// import {PerspectiveCameraObjNode} from '../../nodes/obj/PerspectiveCamera';
import {PolyScene} from '../../scene/PolyScene';
import {TimeController} from '../../scene/utils/TimeController';
import {BaseViewerType} from '../../viewers/_Base';
import {PolyEventsDispatcher, PolyEventName} from '../common/EventsDispatcher';
import {PROGRESS_RATIO} from '../common/Progress';
import {SceneJsonExporterData} from '../json/export/Scene';
import {SceneJsonImporter, ConfigureSceneCallback} from '../json/import/Scene';

export interface LoadSceneOptions {
	onProgress?: OnProgressUpdateCallback;
}
export type LoadScene = (options: LoadSceneOptions) => void;

interface ImportCommonOptions extends LoadSceneOptions {
	domElement?: HTMLElement | string;
	sceneName: string;
	configureScene?: ConfigureSceneCallback;
	assetUrls?: string[];
}

export interface SceneDataImportOptions extends ImportCommonOptions {
	sceneData: SceneJsonExporterData;
	// assetsRoot: string;
	autoPlay?: boolean;
	createViewer?: boolean;
	renderer?: WebGLRenderer;
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
type OnCameraCreatorNodeLoadedResolve = () => void;
type CreateScenePromiseCallback = () => Promise<PolyScene>;

export class ScenePlayerImporter {
	private _scene: PolyScene | undefined;
	private _viewer: BaseViewerType | undefined;
	private _onLoadCompleteCalled = false;
	private _onCameraCreatorNodeLoadedResolve: OnCameraCreatorNodeLoadedResolve | undefined;
	// private _cameraCreatorNode: BaseNodeType | null = null;
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
		this._dispatchEvent(PolyEventName.VIEWER_READY);
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
		scene.root().loadProgress.watchNodesProgress((nodesCookProgress: number, args: OnProgressArguments) => {
			this._onNodesCookProgress(nodesCookProgress, args);
		});
	}
	async loadScene() {
		const createSceneAndWaitForCameraCreatorNode: CreateScenePromiseCallback = () => {
			return new Promise(async (resolve) => {
				const configureScene = this.options.configureScene;
				const importer = new SceneJsonImporter(this.options.sceneData, {
					sceneName: this.options.sceneName,
					configureScene,
					nodeCookWatcher: (scene) => {
						this._watchNodesProgress(scene);
					},
				});

				const scene = importer.scene();
				if (this.options.renderer) {
					scene.renderersRegister.registerRenderer(this.options.renderer);
				}
				// now we must wait that a camera matching the mainCamera is found in the hierarchy.
				this._onCameraCreatorNodeLoadedResolve = () => resolve(scene);
				scene.camerasController.onCameraObjectsUpdated(async () => {
					const camera = await scene.camerasController.mainCamera({findAnyCamera: false});
					if (camera) {
						if (this._onCameraCreatorNodeLoadedResolve) {
							this._onCameraCreatorNodeLoadedResolve();
						}
					}
				});
				// this._cameraCreatorNode = await scene.root().loadProgress.cameraCreatorNode();
			});
		};
		this._scene = await createSceneAndWaitForCameraCreatorNode();
		const scene = this._scene;

		const createViewer = async () => {
			// mount
			const domElement = this._domElement();
			let createViewer = false;
			if (this.options.createViewer != null) {
				createViewer = this.options.createViewer;
			}
			// - if domElement is given, but createViewer is not specified, we assume that the intent is to create the viewer and mount it.
			// - if domElement is null but createViewer is true, we create the viewer, but it will not be mounted.
			if (domElement || createViewer) {
				this._viewer = await scene.camerasController.createMainViewer({
					autoRender: false,
					renderer: this.options.renderer,
				});
				if (this._viewer) {
					if (domElement) {
						this._viewer.mount(domElement);
					}

					if (this._sceneMarkedAsReady == true) {
						this._markViewerAsReady(this._viewer);
					}

					this._dispatchEvent(PolyEventName.VIEWER_MOUNTED);
				}
				// const cameraNode = this._scene.mainCameraNode() as PerspectiveCameraObjNode;
				// if (!cameraNode) {
				// 	console.warn('no main camera found, viewer is not mounted');
				// } else {
				// 	this._viewer = cameraNode.createViewer({
				// 		element: domElement,
				// 		viewerProperties: {autoRender: false},
				// 	});
				// 	// if the scene is marked as ready, and thew viewer hasn't been marked as ready yet,
				// 	// which can happen if there are no nodes to check the progress of,
				// 	// then the viewer should be marked as ready now
				// 	if (this._sceneMarkedAsReady == true) {
				// 		this._markViewerAsReady(this._viewer);
				// 	}

				// 	this._dispatchEvent(PolyEventName.VIEWER_MOUNTED);
				// }
			}
		};

		await createViewer();
		return scene;
	}
	private _domElement(): HTMLElement | undefined {
		const domElement = this.options.domElement;
		if (domElement) {
			if (CoreType.isString(domElement)) {
				const element = document.getElementById(domElement);
				if (element) {
					return element;
				}
			} else {
				return domElement;
			}
		}
	}

	private _dispatchEvent(eventName: PolyEventName) {
		const elements = [this._domElement(), document];
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
