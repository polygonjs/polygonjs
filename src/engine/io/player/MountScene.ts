// import {CoreType} from '../../../core/Type';
// import {SceneJsonImporter} from '../json/import/Scene';
// import {SceneJsonExporterData} from '../json/export/Scene';
// import {ManifestContent, SceneDataManifestImporter} from '../manifest/import/SceneData';

// interface loadSceneData {
// 	sceneName: string;
// 	domElement: string | HTMLElement;
// 	scenesSrcRoot?: string;
// 	scenesDataRoot?: string;
// }

// export async function mountScene(data: loadSceneData) {
// 	const scenesSrcRoot = data.scenesSrcRoot || '/src/polygonjs/scenes';
// 	const scenesDataRoot = data.scenesSrcRoot || '/public/polygonjs/scenes';
// 	const sceneName = data.sceneName;

// 	async function loadManifest(): Promise<ManifestContent> {
// 		const response = await fetch(`${scenesSrcRoot}/${sceneName}/manifest.json`);
// 		const json = await response.json();
// 		return json;
// 	}

// 	async function loadSceneData(manifest: ManifestContent) {
// 		return await SceneDataManifestImporter.importSceneData({
// 			manifest: manifest,
// 			urlPrefix: `${scenesDataRoot}/${sceneName}`,
// 		});
// 	}

// 	async function loadScene(sceneData: SceneJsonExporterData) {
// 		const importer = new SceneJsonImporter(sceneData);
// 		const scene = await importer.scene();

// 		const cameraNode = scene.mainCameraNode();
// 		if (!cameraNode) {
// 			console.warn('no main camera found');
// 			return;
// 		}
// 		const element = CoreType.isString(data.domElement) ? document.getElementById(data.domElement) : data.domElement;
// 		if (!element) {
// 			console.warn('no element to mount the viewer onto');
// 			return;
// 		}
// 		const viewer = cameraNode.createViewer({element});

// 		return {scene, cameraNode, viewer};
// 	}

// 	const manifest = await loadManifest();
// 	const sceneData = await loadSceneData(manifest);
// 	return await loadScene(sceneData);
// }
