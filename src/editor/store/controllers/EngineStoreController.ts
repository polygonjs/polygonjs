import {PolyScene} from 'src/engine/scene/PolyScene';

import {State} from '../Store';
import {Store} from 'vuex';
import {EngineMutation, EngineNodeData, EngineParamData, EnginePayloadByMutationMap} from '../modules/Engine';
import {BaseNodeType, EmitDataByNodeEventMap} from 'src/engine/nodes/_Base';
import {BaseParamType} from 'src/engine/params/_Base';
import {NodeEvent} from 'src/engine/poly/NodeEvent';

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
	// scene mutations
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

	// node mutations
	add_node_params_to_store(node_id: string) {
		this._commit(EngineMutation.NODE_ADD_PARAMS_TO_STORE, node_id);
	}
	update_node_error(node_id: string) {
		// this._store.commit(`engine/${EngineMutation.NODE_ERROR_UPDATED}`, node_id);
		this._commit(EngineMutation.NODE_ERROR_UPDATED, node_id);
	}
	update_node_ui_data_position(node_id: string) {
		this._commit(EngineMutation.NODE_UI_DATA_POSITION_UPDATED, node_id);
	}
	update_node_selection(node_id: string) {
		this._commit(EngineMutation.NODE_SELECTION_UPDATED, node_id);
	}
	update_node_display_flag(node_id: string) {
		this._commit(EngineMutation.NODE_DISPLAY_FLAG_UPDATED, node_id);
	}
	update_node_bypass_flag(node_id: string) {
		this._commit(EngineMutation.NODE_BYPASS_FLAG_UPDATED, node_id);
	}
	update_node_name(node_id: string) {
		this._commit(EngineMutation.NODE_NAME_UPDATED, node_id);
	}
	add_node(node_id: string, data: EmitDataByNodeEventMap[NodeEvent.CREATED]) {
		this._commit(EngineMutation.NODE_CREATED, {parent_id: node_id, child_node_json: data.child_node_json});
	}

	// params
	update_param_raw_input(param_id: string) {
		this._commit(EngineMutation.PARAM_RAW_INPUT_UPDATED, param_id);
	}
	update_param_value(param_id: string) {
		this._commit(EngineMutation.PARAM_VALUE_UPDATED, param_id);
	}
	update_param_expression(param_id: string) {
		this._commit(EngineMutation.PARAM_EXPRESSION_UPDATED, param_id);
	}
	update_param_error(param_id: string) {
		this._commit(EngineMutation.PARAM_ERROR_UPDATED, param_id);
	}

	private _commit<T extends EngineMutation>(mutation: T, arg: EnginePayloadByMutationMap[T]) {
		this._store.commit(`engine/${mutation}`, arg);
	}
}

export const EngineStoreController = EngineStoreControllerClass.instance();
