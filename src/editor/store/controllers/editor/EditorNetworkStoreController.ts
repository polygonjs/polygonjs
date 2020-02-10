import {State} from '../../Store';
import {Store} from 'vuex';
import {EditorNetworkGetter, EditorNetworkMutation} from '../../modules/editor/Network';

export class EditorNetworkStoreControllerClass {
	private _store!: Store<State>;

	private static _instance: EditorNetworkStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorNetworkStoreControllerClass());
	}

	private constructor() {}

	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	node_ids_being_moved(): Readonly<Dictionary<boolean>> {
		return this._store.getters[`editor/network/${EditorNetworkGetter.NODE_IDS_BEING_MOVED}`];
	}

	// mutations
	set_node_ids_being_moved(ids: string[]) {
		this._store.commit(`editor/network/${EditorNetworkMutation.SET_NODE_IDS_BEING_MOVED}`, ids);
	}
	reset_node_ids_being_moved() {
		this._store.commit(`editor/network/${EditorNetworkMutation.RESET_NODE_IDS_BEING_MOVED}`);
	}
}

export const EditorNetworkStoreController = EditorNetworkStoreControllerClass.instance();
