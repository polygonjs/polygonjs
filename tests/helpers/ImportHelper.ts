import {PolyScene} from '../../src/engine/scene/PolyScene';
import {SceneJsonImporter} from '../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../src/engine/io/json/export/Scene';

type SaveLoadSceneCallback = (scene: PolyScene) => Promise<void>;

export async function saveAndLoadScene(scene: PolyScene, callback: SaveLoadSceneCallback) {
	const data = new SceneJsonExporter(scene).data();

	// console.log('************ LOAD **************');
	const importer = new SceneJsonImporter(data);
	const newScene = await importer.scene();

	await callback(newScene);
}

export async function sceneFromScene(scene: PolyScene) {
	const data = new SceneJsonExporter(scene).data();

	// console.log('************ LOAD **************');
	const importer = new SceneJsonImporter(data);
	const newScene = await importer.scene();
	return newScene;
}
