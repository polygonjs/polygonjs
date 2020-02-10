import {PolyScene} from 'src/engine/scene/PolyScene';

import {State} from '../Store';
import {Store} from 'vuex';
import {EngineMutation, EngineNodeData, EngineParamData} from '../modules/Engine';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {BaseParamType} from 'src/engine/params/_Base';

export class EngineStoreControllerClass {
	private _store!: Store<State>;
	private _scene!: PolyScene;

	private static _instance: EngineStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EngineStoreControllerClass());
	}

	private constructor() {}
	set_scene(scene: PolyScene) {
		this._scene = scene;
		this.update_scene();
	}
	get scene() {
		return this._scene;
	}
	set_store(store: Store<State>) {
		this._store = store;
		this.update_scene();
	}

	node(id: string): BaseNodeType | null {
		return this._scene.graph.node_from_id(id) as BaseNodeType;
	}
	param(id: string): BaseParamType | null {
		return this._scene.graph.node_from_id(id) as BaseParamType;
	}

	// getters
	json_node(id: string): EngineNodeData | null {
		return this._store.getters['engine/json_node'](id);
	}
	json_param(id: string): EngineParamData | null {
		return this._store.getters['engine/json_param'](id);
	}
	json_children(id: string): EngineNodeData[] {
		const json_node = this.json_node(id);
		if (json_node) {
			return this._store.getters['engine/json_children'](json_node);
		} else {
			return [];
		}
	}
	frame(): number {
		return this._store.getters['engine/frame'];
	}
	frame_range(): Number2 {
		return this._store.getters['engine/frame_range'];
	}
	frame_range_locked(): Boolean2 {
		return this._store.getters['engine/frame_range_locked'];
	}
	playing_state(): boolean {
		return this._store.getters['engine/playing_state'];
	}

	// mutations
	update_scene() {
		if (this._store && this._scene) {
			this._store.commit(`engine/${EngineMutation.SCENE}`);
		}
	}
	update_frame() {
		this._store.commit(`engine/${EngineMutation.SCENE_FRAME_UPDATED}`);
	}
	update_frame_range() {
		this._store.commit(`engine/${EngineMutation.SCENE_FRAME_RANGE_UPDATED}`);
	}
	update_play_state() {
		this._store.commit(`engine/${EngineMutation.SCENE_PLAY_STATE_UPDATED}`);
	}
}

export const EngineStoreController = EngineStoreControllerClass.instance();
