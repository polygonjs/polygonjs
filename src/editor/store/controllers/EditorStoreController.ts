import {PolyScene} from 'src/engine/scene/PolyScene';

import {State} from '../Store';
import {Store} from 'vuex';
import {BaseNodeType} from 'src/engine/nodes/_Base.js';
import {StoreController} from './StoreController';

import {EditorNetworkStoreController} from './editor/EditorNetworkStoreController';

export class EditorStoreControllerClass {
	private _store!: Store<State>;
	private _scene!: PolyScene;

	public readonly network = EditorNetworkStoreController;

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

	// non store methods
	save_scene() {
		// TODO
	}

	// getters
	current_node_graph_id(): string | undefined {
		return this._store.getters['editor/current_node_id'];
	}
	current_node(): BaseNodeType {
		const id = this.current_node_graph_id();
		if (id) {
			const node = this._scene.graph.node_from_id(id);
			if (node) {
				return node as BaseNodeType;
			}
		}
		return StoreController.scene.root;
	}

	// mutations
	set_current_node(node: BaseNodeType) {
		this._store.commit('editor/current_node', node);
	}
	go_up() {
		const parent = this.current_node().parent;
		if (parent) {
			this.set_current_node(parent);
		}
	}
	go_down() {
		const node = this.current_node();
		if (node.children_allowed() && node.children_controller) {
			const child_node = node.children_controller.selection.nodes()[0];
			if (child_node) {
				this.set_current_node(child_node);
			}
		}
	}
}

export const EditorStoreController = EditorStoreControllerClass.instance();
