import {SceneJsonImporter} from '../io/json/import/Scene';
import {SceneJsonExporterData} from '../io/json/export/Scene';
import {Poly} from '../Poly';
import {BlobUrlData} from './BlobsController';
import {ViewerData, ViewerDataByElement} from './Common';
import {DomEffects} from '../../core/DomEffects';

type SceneJsonImporterContructor = typeof SceneJsonImporter;

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

		this._loadScene(element, sceneData, sceneJsonImporterContructor);
	}

	private async _loadScene(
		element: HTMLElement,
		sceneData: SceneJsonExporterData,
		sceneJsonImporterContructor: SceneJsonImporterContructor
	) {
		this._fadeOutPoster(element);

		const importer = new sceneJsonImporterContructor(sceneData);
		const scene = await importer.scene();
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
				element.removeChild(posterElement);
			});
		}
	}
}
