import {SceneJsonImporter} from '../io/json/import/Scene';
import {SceneJsonExporterData} from '../io/json/export/Scene';
import {Poly} from '../Poly';
import {BlobUrlData} from './BlobsController';
import {ViewerData, ViewerDataByElement, UnzippedData} from './Common';
import {DomEffects} from '../../core/DomEffects';
import {SelfContainedFileName} from '../io/self_contained/Common';
import {PolyScene} from '../scene/PolyScene';

type SceneJsonImporterContructor = typeof SceneJsonImporter;

interface PolyConfigIds {
	Poly: string;
	scriptElementId: string;
	loadSceneArgs: string;
}
interface LoadSceneArgs {
	method: (
		element: HTMLElement,
		sceneData: SceneJsonExporterData,
		sceneJsonImporterContructor: typeof SceneJsonImporter
	) => Promise<void>;
	element: HTMLElement;
	sceneData: SceneJsonExporterData;
	sceneJsonImporterContructor: SceneJsonImporterContructor;
}

export class SelfContainedScenesLoader {
	private _sceneJsonImporterContructor: SceneJsonImporterContructor | undefined;
	markAsLoaded(callback: () => void, sceneJsonImporterContructor: SceneJsonImporterContructor) {
		this._sceneJsonImporterContructor = sceneJsonImporterContructor;
		callback();
	}

	// the SceneJsonImporterContructor is required here.
	// if it is not given, the whole js will fail to load with a circular loading type of error
	load(map: ViewerDataByElement) {
		if (!this._sceneJsonImporterContructor) {
			return;
		}
		const elements: HTMLElement[] = [];
		map.forEach((data, element) => {
			elements.push(element);
		});
		for (let element of elements) {
			const data = map.get(element);
			if (data) {
				this._loadElement(element, data, this._sceneJsonImporterContructor);
				map.delete(element);
			}
		}
	}
	private async _loadElement(
		element: HTMLElement,
		viewerData: ViewerData,
		sceneJsonImporterContructor: SceneJsonImporterContructor
	) {
		const {sceneData, assetsManifest, unzippedData} = viewerData;
		const storedUrls = Object.keys(assetsManifest);
		for (let storedUrl of storedUrls) {
			const assetUrl = assetsManifest[storedUrl];
			const assetUintArray = unzippedData[`assets/${assetUrl}`];
			if (!assetUintArray) {
				console.error(storedUrl, assetUintArray);
				return;
			}
			const assetBlob = new Blob([assetUintArray]);
			const blobUrl = Poly.blobs.createBlobUrl(assetBlob);
			const blobUrlData: BlobUrlData = {
				storedUrl,
				blobUrl,
			};
			Poly.blobs.registerBlobUrl(blobUrlData);
		}
		Poly.setPlayerMode(true);
		Poly.libs.setRoot(null);

		const polyConfigId = `${Math.random()}`.replace('.', '_');
		const ids: PolyConfigIds = {
			Poly: `___POLY_polyConfig_configurePolygonjs_${polyConfigId}`,
			scriptElementId: `___POLY_polyConfig_scriptElement_${polyConfigId}`,
			loadSceneArgs: `___POLY_polyConfig_loadSceneArgs_${polyConfigId}`,
		};
		(window as any)[ids.Poly] = Poly;
		const method = this._loadScene.bind(this);
		const loadSceneArgs: LoadSceneArgs = {
			method,
			element,
			sceneData,
			sceneJsonImporterContructor,
		};
		(window as any)[ids.loadSceneArgs] = loadSceneArgs;

		// if polyConfig is loaded,
		// the scene will be loaded from _loadPolyConfig.
		// if it is not, the scene will be loaded in this function
		const polyConfigLoaded = this._loadPolyConfig(ids, unzippedData);
		if (polyConfigLoaded) {
			return;
		}
		this._loadScene(element, sceneData, sceneJsonImporterContructor);
	}

	private _loadPolyConfig(ids: PolyConfigIds, unzippedData: UnzippedData) {
		const polyConfigArray = unzippedData[SelfContainedFileName.POLY_CONFIG];
		if (!polyConfigArray) {
			return false;
		}
		const polyConfigUrl = this._createJsBlob(polyConfigArray, 'polyConfig');
		console.log('loading polyConfigUrl', polyConfigUrl);

		let script = document.getElementById(ids.scriptElementId);

		const lines: string[] = [];
		lines.push(`import {configurePolygonjs, configureScene} from '${polyConfigUrl}';`);
		lines.push(`configurePolygonjs(window.${ids.Poly});`);
		lines.push(
			`window.${ids.loadSceneArgs}.method(window.${ids.loadSceneArgs}.element, window.${ids.loadSceneArgs}.sceneData, window.${ids.loadSceneArgs}.sceneJsonImporterContructor, configureScene);`
		);
		lines.push(`delete window.${ids.loadSceneArgs};`);

		if (!script) {
			script = document.createElement('script') as HTMLScriptElement;
			script.setAttribute('type', 'module');
			(script as any).text = lines.join('\n');
			document.body.append(script);
		}
		return true;
	}

	private async _loadScene(
		element: HTMLElement,
		sceneData: SceneJsonExporterData,
		sceneJsonImporterContructor: SceneJsonImporterContructor,
		configureScene?: (scene: PolyScene) => void
	) {
		this._fadeOutPoster(element);

		const importer = new sceneJsonImporterContructor(sceneData);
		const scene = await importer.scene();

		if (configureScene) {
			configureScene(scene);
		}

		const cameraNode = scene.masterCameraNode();
		if (!cameraNode) {
			console.warn('no master camera found');
			return;
		}
		const viewer = cameraNode.createViewer(element);
		scene.play();

		// we attach scene and viewer to the element
		// to allow easy js API access for customization.
		(element as any).scene = scene;
		(element as any).viewer = viewer;
	}

	private _fadeOutPoster(element: HTMLElement) {
		const posterElement = element.firstElementChild as HTMLElement;
		if (posterElement) {
			posterElement.style.pointerEvents = 'none';
			DomEffects.fadeOut(posterElement).then(() => {
				posterElement.parentElement?.removeChild(posterElement);
			});
		}
	}

	private _createJsBlob(array: Uint8Array, filename: string) {
		const blob = new Blob([array]);
		const file = new File([blob], `${filename}.js`, {type: 'application/javascript'});
		var urlCreator = window.URL || window.webkitURL;
		return urlCreator.createObjectURL(file);
	}
}
