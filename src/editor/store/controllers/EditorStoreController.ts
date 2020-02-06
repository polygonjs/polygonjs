import {PolyScene} from 'src/engine/scene/PolyScene';

import {State} from '../Store';
import {Store} from 'vuex';
import {BaseNodeType} from 'src/engine/nodes/_Base.js';

export class EditorStoreControllerClass {
	private _store!: Store<State>;
	private _scene!: PolyScene;

	private static _instance: EditorStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorStoreControllerClass());
	}

	private constructor() {}
	set_scene(scene: PolyScene) {
		this._scene = scene;
	}
	get scene() {
		return this._scene;
	}
	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	current_node(): BaseNodeType | undefined {
		const id = this._store.getters['editor/current_node_id'];
		const node = this._scene.graph.node_from_id(id);
		if (node) {
			return node as BaseNodeType;
		}
	}

	// mutations
	set_current_node(node: BaseNodeType) {
		this._store.commit('editor/current_node', node);
	}
}

export const EditorStoreController = EditorStoreControllerClass.instance();
