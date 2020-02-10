import {State} from '../../Store';
import {Store} from 'vuex';
import {EditorClipboardMutation, EditorClipboardState} from '../../modules/editor/Clipboard';

export class EditorClipboardStoreControllerClass {
	private _store!: Store<State>;

	private static _instance: EditorClipboardStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorClipboardStoreControllerClass());
	}

	private constructor() {}

	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	get local_state(): EditorClipboardState {
		return (<unknown>(this._store.state.editor as any).context_menu) as EditorClipboardState;
	}
	param_id(): string | null {
		return this.local_state.param_id;
	}
	upload_name(): string | null {
		return this.local_state.upload_name;
	}

	// mutations
	set_param_id(param_id: string): void {
		this._store.commit(`editor/context_menu/${EditorClipboardMutation.PARAM_ID}`, param_id);
	}
	set_upload_name(name: string): void {
		this._store.commit(`editor/context_menu/${EditorClipboardMutation.UPLOAD_NAME}`, name);
	}
}

export const EditorClipboardStoreController = EditorClipboardStoreControllerClass.instance();
