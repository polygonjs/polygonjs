import {State} from '../../Store';
import {Store} from 'vuex';
import {
	EditorPanelNodeSelectorMutation,
	EditorPanelNodeSelectorState,
	EditorPanelNodeSelectorOptions,
} from '../../modules/editor/PanelNodeSelector';

export class EditorPanelNodeSelectorStoreControllerClass {
	private _store!: Store<State>;

	private static _instance: EditorPanelNodeSelectorStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorPanelNodeSelectorStoreControllerClass());
	}

	private constructor() {}

	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	get local_state(): EditorPanelNodeSelectorState {
		return (<unknown>(this._store.state.editor as any).dialog_prompt) as EditorPanelNodeSelectorState;
	}
	param_id(): string | null {
		return this.local_state.param_id;
	}

	// mutations
	open(options: EditorPanelNodeSelectorOptions): void {
		this._store.commit(`editor/panel_node_selector/${EditorPanelNodeSelectorMutation.OPEN}`, options);
	}
	close() {
		this._store.commit(`editor/panel_node_selector/${EditorPanelNodeSelectorMutation.CLOSE}`);
	}
}

export const EditorPanelNodeSelectorStoreController = EditorPanelNodeSelectorStoreControllerClass.instance();
