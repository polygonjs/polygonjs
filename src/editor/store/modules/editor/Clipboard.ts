export interface EditorClipboardState {
	node_id: string | null;
	param_id: string | null;
	// upload_name: string | null;
}

export enum EditorClipboardMutation {
	NODE_ID = 'NODE_ID',
	PARAM_ID = 'PARAM_ID',
	// UPLOAD_NAME = 'UPLOAD_NAME',
}

export const EditorClipboardStateModule = {
	namespaced: true,
	state(): EditorClipboardState {
		return {
			node_id: null,
			param_id: null,
			// upload_name: null,
		};
	},

	// getters: {
	// 	upload_name(state:EditorClipboardState) {
	// 		return state.upload_name;
	// 	},
	// 	param(state) {
	// 		return state.param;
	// 	},
	// },

	mutations: {
		[EditorClipboardMutation.NODE_ID]: (state: EditorClipboardState, payload: string) => {
			state.node_id = payload;
		},
		[EditorClipboardMutation.PARAM_ID]: (state: EditorClipboardState, payload: string) => {
			state.param_id = payload;
		},
		// [EditorClipboardMutation.UPLOAD_NAME]: (state: EditorClipboardState, payload: string) => {
		// 	state.upload_name = payload;
		// },
	},
};
