import {PolyScene} from 'src/engine/scene/PolyScene';

import 'src/engine/poly/registers/All';
import {SceneJsonExporterData} from 'src/engine/io/json/export/Scene';
import {SceneJsonImporter} from 'src/engine/io/json/import/Scene';
import default_scene_data from '../../../public/examples/scenes/default_simple.json';

const default_scene = SceneJsonImporter.load_data(default_scene_data as SceneJsonExporterData);

class StoreControllerClass {
	private static _instance: StoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new StoreControllerClass(default_scene));
	}

	private constructor(private _scene: PolyScene) {}
	set_scene(scene: PolyScene) {
		this._scene = scene;
	}
	get scene() {
		return this._scene;
	}
}

export const StoreController = StoreControllerClass.instance();
