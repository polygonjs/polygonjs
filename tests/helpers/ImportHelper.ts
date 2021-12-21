import {PolyScene} from '../../src/engine/scene/PolyScene';
import {SceneJsonImporter} from '../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../src/engine/io/json/export/Scene';

type SaveLoadSceneCallback = (scene: PolyScene) => Promise<void>;

export async function saveAndLoadScene(scene: PolyScene, callback: SaveLoadSceneCallback) {
	const data = new SceneJsonExporter(scene).data();

	// console.log('************ LOAD **************');
	const newScene = await SceneJsonImporter.loadData(data);

	await callback(newScene);
}
