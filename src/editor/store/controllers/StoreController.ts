import {PolyScene} from 'src/engine/scene/PolyScene';

import 'src/engine/poly/registers/All';
import {SceneJsonExporterData} from 'src/engine/io/json/export/Scene';
import {SceneJsonImporter} from 'src/engine/io/json/import/Scene';
import default_scene_data from '../../../../public/examples/scenes/default_simple.json';

const default_scene = SceneJsonImporter.load_data(default_scene_data as SceneJsonExporterData);

import {EditorStoreController, EditorStoreControllerClass} from './EditorStoreController';
import {EngineStoreController, EngineStoreControllerClass} from './EngineStoreController';
import {Store} from 'vuex';
import {State} from '../Store';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {SceneEvent} from 'src/engine/poly/SceneEvent';

class StoreControllerClass {
	private static _instance: StoreControllerClass;

	public readonly editor: EditorStoreControllerClass = EditorStoreController;
	public readonly engine: EngineStoreControllerClass = EngineStoreController;

	static instance() {
		return (this._instance = this._instance || new StoreControllerClass(default_scene));
	}

	private constructor(private _scene: PolyScene) {
		(window as any).scene = this._scene;
		this.set_scene(this._scene);
	}
	set_scene(scene: PolyScene) {
		this._scene = scene;
		this._scene.events_controller.set_listener(this);
		this.editor.set_scene(scene);
		this.engine.set_scene(scene);
	}
	get scene() {
		return this._scene;
	}

	set_store(store: Store<State>) {
		this.editor.set_store(store);
		this.engine.set_store(store);
	}

	process_events(emitter: CoreGraphNode, event_name: string, data: object | null) {
		switch (event_name) {
			case SceneEvent.FRAME_UPDATED:
				this.engine.update_frame();
				break;
			case SceneEvent.FRAME_RANGE_UPDATED:
				this.engine.update_frame_range();
				break;
			case SceneEvent.PLAY_STATE_UPDATED:
				this.engine.update_play_state();
				break;
		}
	}
}

export const StoreController = StoreControllerClass.instance();
