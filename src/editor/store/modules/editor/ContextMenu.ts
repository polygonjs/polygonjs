export interface EditorContextMenuState {
	position: Vector2Like;
	param_id: string | null;
	node_id: string | null;
	// upload_name: string | null;
}

export enum EditorContextMenuMutation {
	POSITION = 'POSITION',
	PARAM_ID = 'PARAM_ID',
	NODE_ID = 'NODE_ID',
	// UPLOAD_NAME = 'UPLOAD_NAME',
}

const reset_menu = function(state: EditorContextMenuState) {
	state.param_id = null;
	state.node_id = null;
	// state.upload_name = null;
};

export const EditorContextMenuStateModule = {
	namespaced: true,
	state(): EditorContextMenuState {
		return {
			position: {
				x: 0,
				y: 0,
			},
			param_id: null,
			node_id: null,
			// upload_name: null,
		};
	},

	// getters: {
	// 	position(state:EditorContextMenuState) {
	// 		return state.position;
	// 	},
	// 	param_id(state:EditorContextMenuState) {
	// 		return state.param_id;
	// 	},
	// 	node_id(state:EditorContextMenuState) {
	// 		return state.node_id;
	// 	},
	// 	upload_name(state:EditorContextMenuState) {
	// 		return state.upload_name;
	// 	},
	// },

	mutations: {
		[EditorContextMenuMutation.POSITION]: (state: EditorContextMenuState, position: Vector2Like) => {
			state.position.x = position.x;
			state.position.y = position.y;
		},
		[EditorContextMenuMutation.PARAM_ID]: (state: EditorContextMenuState, payload: string) => {
			reset_menu(state);
			state.param_id = payload;
		},
		[EditorContextMenuMutation.NODE_ID]: (state: EditorContextMenuState, payload: string) => {
			reset_menu(state);
			state.node_id = payload;
		},
		// [EditorContextMenuMutation.UPLOAD_NAME]: (state: EditorContextMenuState, payload: string) => {
		// 	reset_menu(state);
		// 	state.upload_name = payload;
		// },
	},
};
