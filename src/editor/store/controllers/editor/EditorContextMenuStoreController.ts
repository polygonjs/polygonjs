import {State} from '../../Store';
import {Store} from 'vuex';
import {EditorContextMenuMutation, EditorContextMenuState} from '../../modules/editor/ContextMenu';

export class EditorContextMenuStoreControllerClass {
	private _store!: Store<State>;

	private static _instance: EditorContextMenuStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorContextMenuStoreControllerClass());
	}

	private constructor() {}

	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	get local_state(): EditorContextMenuState {
		return (<unknown>(this._store.state.editor as any).context_menu) as EditorContextMenuState;
	}
	position(): Vector2Like {
		return this.local_state.position;
	}
	node_id(): string | null {
		return this.local_state.node_id;
	}
	param_id(): string | null {
		return this.local_state.param_id;
	}
	upload_name(): string | null {
		return this.local_state.upload_name;
	}

	// mutations
	set_position(position: Vector2Like): void {
		this._store.commit(`editor/context_menu/${EditorContextMenuMutation.POSITION}`, position);
	}
	set_node_id(node_id: string | null): void {
		this._store.commit(`editor/context_menu/${EditorContextMenuMutation.NODE_ID}`, node_id);
	}
	set_param_id(param_id: string | null): void {
		this._store.commit(`editor/context_menu/${EditorContextMenuMutation.PARAM_ID}`, param_id);
	}
	set_upload_name(name: string): void {
		this._store.commit(`editor/context_menu/${EditorContextMenuMutation.UPLOAD_NAME}`, name);
	}
}

export const EditorContextMenuStoreController = EditorContextMenuStoreControllerClass.instance();
