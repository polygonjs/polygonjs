import {PolyScene, SceneJsonImporter} from '../../src/engine/index_all';
import {SceneJsonExporter} from '../../src/engine/io/json/export/Scene';

type SaveLoadSceneCallback = (scene: PolyScene) => Promise<void>;

export async function saveAndLoadScene(scene: PolyScene, callback: SaveLoadSceneCallback) {
	const data = new SceneJsonExporter(scene).data();

	// console.log('************ LOAD **************');
	const newScene = await SceneJsonImporter.loadData(data);

	await callback(newScene);
}
