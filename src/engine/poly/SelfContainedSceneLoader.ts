import {SceneJsonImporter} from '../io/json/import/Scene';
import {SceneJsonExporterData} from '../io/json/export/Scene';
import {Poly} from '../Poly';
import {BlobUrlData} from './BlobsController';
import {ViewerData, ViewerDataByElement} from './Common';

type SceneJsonImporterContructor = typeof SceneJsonImporter;

export class SelfContainedScenesLoader {
	// the SceneJsonImporterContructor is required here.
	// if it is not given, the whole js will fail to load with a circular loading type of error
	load(map: ViewerDataByElement, sceneJsonImporterContructor: SceneJsonImporterContructor) {
		map.forEach((data, element) => {
			this._loadElement(element, data, sceneJsonImporterContructor);
		});
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
		// Poly.libs.setDRACOGLTFPath(null);
		await this._loadScene(element, sceneData, sceneJsonImporterContructor);
	}
	private async _loadScene(
		element: HTMLElement,
		sceneData: SceneJsonExporterData,
		sceneJsonImporterContructor: SceneJsonImporterContructor
	) {
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
}
