import Vue from 'vue';

export interface EditorNetworkState {
	node_ids_being_moved: Dictionary<boolean>;
}

export enum EditorNetworkGetter {
	NODE_IDS_BEING_MOVED = 'NODE_IDS_BEING_MOVED',
}

export enum EditorNetworkMutation {
	SET_NODE_IDS_BEING_MOVED = 'SET_NODE_IDS_BEING_MOVED',
	RESET_NODE_IDS_BEING_MOVED = 'RESET_NODE_IDS_BEING_MOVED',
}

export const EditorNetworkStateModule = {
	namespaced: true,
	state(): EditorNetworkState {
		return {
			node_ids_being_moved: {},
		};
	},

	getters: {
		[EditorNetworkGetter.NODE_IDS_BEING_MOVED]: (state: EditorNetworkState) => {
			return state.node_ids_being_moved;
		},
	},

	mutations: {
		[EditorNetworkMutation.SET_NODE_IDS_BEING_MOVED]: (state: EditorNetworkState, payload: string[]) => {
			for (let id of payload) {
				Vue.set(state.node_ids_being_moved, id, true);
			}
		},
		[EditorNetworkMutation.RESET_NODE_IDS_BEING_MOVED]: (state: EditorNetworkState) => {
			Vue.set(state, 'node_ids_being_moved', {});
		},
	},
};
