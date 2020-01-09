import {CorePerformance} from 'src/core/performance/CorePerformance';
import {PolyScene} from 'src/engine/scene/PolyScene';

import {ContextOwner} from './concerns/ContextOwner';
import {SceneNodeDirtyable} from './SceneNodeDirtyable';

interface EmitsCountByEventName {
	[propName: string]: number;
}
export interface EmitPayload {
	emitter: NodeScene;
	data?: object;
}

export class NodeScene extends ContextOwner(SceneNodeDirtyable) {
	_emits_count_by_event_name: EmitsCountByEventName = {};
	_performance: CorePerformance;

	// constructor(...args: any[]){
	// 	super(...args);
	// }
	constructor() {
		super();
	}

	_init_node_scene(): void {
		this._init_context_owner();
		// this._init_dirtyable();
		this._init_graph_node(this.scene().graph);

		this._emits_count_by_event_name = {};
	}
	set_scene(scene: PolyScene): void {
		if (this._scene == null) {
			this._scene = scene;
			this._display_scene = scene.display_scene;
			if (!this._display_scene) {
				throw 'no display scene found';
			}
			this._performance = scene.performance;
			this._init_node_scene();
		}
	}
	// TODO: do I still need this?
	// is_time_dependent: ->
	// 	false # is overriden in node and param
	emits_count(event_name: string): number {
		return this._emits_count_by_event_name[event_name] || 0;
	}

	emit(event_name: string, data: object = null): void {
		// TODO: it should ideally be when the scene is loading,
		// but the scene loading time is still too long
		// although I may only block some events, like param sets and node add
		//return if window.scene.is_loading()
		if (this.scene() == null || !this.scene().emit_controller.emit_allowed) {
			return;
		}

		if (this._emits_count_by_event_name[event_name] == null) {
			this._emits_count_by_event_name[event_name] = 0;
		}
		this._emits_count_by_event_name[event_name] += 1;

		const payload: EmitPayload = {
			emitter: this,
		};

		if (data != null) {
			payload['data'] = data;
		}

		this.scene().emit_controller.store_commit(event_name, payload);
	}
	set_dirty_allowed(original_trigger_graph_node: SceneNodeDirtyable) {
		return original_trigger_graph_node.graph_node_id() != this._context.entity_graph_node().graph_node_id();
	}
}
