export interface EditorClipboardState {
	upload_name: string | null;
	param_id: string | null;
}

export enum EditorClipboardMutation {
	PARAM_ID = 'PARAM_ID',
	UPLOAD_NAME = 'UPLOAD_NAME',
}

export const EditorClipboardStateModule = {
	namespaced: true,
	state(): EditorClipboardState {
		return {
			upload_name: null,
			param_id: null,
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
		[EditorClipboardMutation.UPLOAD_NAME]: (state: EditorClipboardState, payload: string) => {
			state.upload_name = payload;
		},
		[EditorClipboardMutation.PARAM_ID]: (state: EditorClipboardState, payload: string) => {
			state.param_id = payload;
		},
	},
};
