import {PolyScene} from '../../src/engine/scene/PolyScene';
import {SceneJsonImporter} from '../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../src/engine/io/json/export/Scene';
import {ScenePlayerImporter} from '../../src/engine/io/player/Scene';

type SaveLoadSceneCallback = (scene: PolyScene) => Promise<void>;

export async function saveAndLoadScene(scene: PolyScene, callback: SaveLoadSceneCallback) {
	const data = await new SceneJsonExporter(scene).data();

	// console.log('************ LOAD **************');
	const importer = new SceneJsonImporter(data);
	const newScene = await importer.scene();

	await callback(newScene);
}

export async function saveAndLoadSceneWithPlayerLoader(scene: PolyScene, callback: SaveLoadSceneCallback) {
	const sceneData = await new SceneJsonExporter(scene).data();

	// console.log('************ LOAD **************');
	// const importer = new SceneJsonImporter(data);
	// const newScene = await importer.scene();
	const loadedData = await ScenePlayerImporter.loadSceneData({
		sceneName: scene.name() || 'test',
		sceneData,
	});
	const newScene = loadedData.scene;

	await callback(newScene);
}

export async function sceneFromScene(scene: PolyScene) {
	const data = await new SceneJsonExporter(scene).data();

	// console.log('************ LOAD **************');
	const importer = new SceneJsonImporter(data);
	const newScene = await importer.scene();
	return newScene;
}
