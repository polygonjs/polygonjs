import {PolyScene} from 'src/engine/scene/PolyScene';

import {EditorStoreController, EditorStoreControllerClass} from './EditorStoreController';
import {EngineStoreController, EngineStoreControllerClass} from './EngineStoreController';
import {Store} from 'vuex';
import {State} from '../Store';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {SceneEvent} from 'src/engine/poly/SceneEvent';
import {NodeEvent} from 'src/engine/poly/NodeEvent';
// import {BaseNodeType, EmitDataByNodeEventMap} from 'src/engine/nodes/_Base';
import {ParamEvent} from 'src/engine/poly/ParamEvent';

class StoreControllerClass {
	private static _instance: StoreControllerClass;
	private _scene!: PolyScene;

	public readonly editor: EditorStoreControllerClass = EditorStoreController;
	public readonly engine: EngineStoreControllerClass = EngineStoreController;

	static instance() {
		return (this._instance = this._instance || new StoreControllerClass());
	}

	private constructor() {}
	set_scene(scene: PolyScene) {
		this._scene = scene;
		this._scene.events_controller.set_listener(this);
		this.editor.set_scene(scene);
		this.engine.set_scene(scene);

		this.editor.set_current_node(scene.root);
	}
	get scene() {
		return this._scene;
	}

	set_store(store: Store<State>) {
		this.editor.set_store(store);
		this.engine.set_store(store);
	}

	// process_events<T extends NodeEvent>(emitter: BaseNodeType, event_name: T, data: EmitDataByNodeEventMap[T]): void;
	// process_events(emitter: PolyScene, event_name: SceneEvent): void;
	process_events(emitter: CoreGraphNode, event_name: SceneEvent | NodeEvent | ParamEvent, data?: any): void {
		// if (emitter instanceof PolyScene) {
		// 	switch (event_name) {
		// 		// scene events
		// 	}
		// }
		if (emitter instanceof CoreGraphNode) {
			switch (event_name) {
				// scene events
				case SceneEvent.FRAME_UPDATED:
					return this.engine.update_frame();
				case SceneEvent.FRAME_RANGE_UPDATED:
					return this.engine.update_frame_range();
				case SceneEvent.PLAY_STATE_UPDATED:
					return this.engine.update_play_state();

				// node events
				case NodeEvent.ERROR_UPDATED:
					return this.engine.update_node_error(emitter.graph_node_id);
				case NodeEvent.UI_DATA_POSITION_UPDATED:
					return this.engine.update_node_ui_data_position(emitter.graph_node_id);
				case NodeEvent.SELECTION_UPDATED:
					return this.engine.update_node_selection(emitter.graph_node_id);
				case NodeEvent.FLAG_DISPLAY_UPDATED:
					return this.engine.update_node_display_flag(emitter.graph_node_id);
				case NodeEvent.FLAG_BYPASS_UPDATED:
					return this.engine.update_node_bypass_flag(emitter.graph_node_id);
				case NodeEvent.NAME_UPDATED:
					return this.engine.update_node_name(emitter.graph_node_id);
				case NodeEvent.CREATED:
					return this.engine.add_node(emitter.graph_node_id, data);

				// param events
				case ParamEvent.VALUE_UPDATED:
					return this.engine.update_param_value(emitter.graph_node_id);
				case ParamEvent.EXPRESSION_UPDATED:
					return this.engine.update_param_expression(emitter.graph_node_id);
				case ParamEvent.ERROR_UPDATED:
					return this.engine.update_param_error(emitter.graph_node_id);
			}
		}
		console.warn('event not processed', emitter, event_name, data);
	}
}

export const StoreController = StoreControllerClass.instance();
