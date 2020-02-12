import {PolyScene} from 'src/engine/scene/PolyScene';

import {State} from '../Store';
import {Store} from 'vuex';
import {BaseNodeType} from 'src/engine/nodes/_Base.js';
import {StoreController} from './StoreController';

import {EditorClipboardStoreController} from './editor/EditorClipboardStoreController';
import {EditorContextMenuStoreController} from './editor/EditorContextMenuStoreController';
import {EditorDialogAlertStoreController} from './editor/EditorDialogAlertStoreController';
import {EditorDialogConfirmStoreController} from './editor/EditorDialogConfirmStoreController';
import {EditorDialogPromptStoreController} from './editor/EditorDialogPromptStoreController';
import {EditorNetworkStoreController} from './editor/EditorNetworkStoreController';
import {EditorNumericSliderStoreController} from './editor/EditorNumericSliderStoreController';
import {EditorPanelNodeSelectorStoreController} from './editor/EditorPanelNodeSelectorController';
import {EngineNodeData} from '../modules/Engine';

export class EditorStoreControllerClass {
	private _store!: Store<State>;
	private _scene!: PolyScene;

	public readonly clipboard = EditorClipboardStoreController;
	public readonly context_menu = EditorContextMenuStoreController;
	public readonly dialog_alert = EditorDialogAlertStoreController;
	public readonly dialog_confirm = EditorDialogConfirmStoreController;
	public readonly dialog_prompt = EditorDialogPromptStoreController;
	public readonly network = EditorNetworkStoreController;
	public readonly numeric_slider = EditorNumericSliderStoreController;
	public readonly panel_node_selector = EditorPanelNodeSelectorStoreController;

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
		this.clipboard.set_store(store);
		this.context_menu.set_store(store);
		this.dialog_alert.set_store(store);
		this.dialog_confirm.set_store(store);
		this.dialog_prompt.set_store(store);
		this.network.set_store(store);
		this.numeric_slider.set_store(store);
		this.panel_node_selector.set_store(store);
	}

	// getters
	current_node_graph_id(): string | undefined {
		return this._store.getters['editor/current_node_id'];
	}
	current_json_node(): EngineNodeData | null {
		const id = this.current_node_graph_id();
		if (id) {
			return StoreController.engine.json_node(id);
		} else {
			return null;
		}
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
