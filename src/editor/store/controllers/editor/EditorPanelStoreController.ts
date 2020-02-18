import {State} from '../../Store';
import {Store} from 'vuex';
import {EditorPanelMutation, EditorPanelState} from '../../modules/editor/Panel';

export class EditorPanelStoreControllerClass {
	private _store!: Store<State>;

	private static _instance: EditorPanelStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorPanelStoreControllerClass());
	}

	private constructor() {}

	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	get local_state(): EditorPanelState {
		return (<unknown>(this._store.state.editor as any).panel) as EditorPanelState;
	}
	fullscreen_panel_id(): string | null {
		return this.local_state.fullscreen_panel_id;
	}

	// mutations
	set_fullscreen_panel_id(panel_id: string | null): void {
		this._store.commit(`editor/panel/${EditorPanelMutation.FULLSCREEN_PANEL_ID}`, panel_id);
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		}, 0);
	}
}

export const EditorPanelStoreController = EditorPanelStoreControllerClass.instance();
