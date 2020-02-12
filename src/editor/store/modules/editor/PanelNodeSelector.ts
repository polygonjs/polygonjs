export interface EditorPanelNodeSelectorState {
	// panel_id: string | null;
	param_id: string | null;
}
export interface EditorPanelNodeSelectorOptions {
	param_id: string;
}
export enum EditorPanelNodeSelectorMutation {
	OPEN = 'OPEN',
	CLOSE = 'CLOSE',
}

export const EditorPanelNodeSelectorStateModule = {
	namespaced: true,
	state(): EditorPanelNodeSelectorState {
		return {param_id: null};
	},

	// getters: {
	// 	panel_id(state:EditorPanelNodeSelectorState) {
	// 		return state.panel_id;
	// 	},
	// },

	mutations: {
		[EditorPanelNodeSelectorMutation.OPEN]: (
			state: EditorPanelNodeSelectorState,
			payload: EditorPanelNodeSelectorOptions
		) => {
			state.param_id = payload.param_id;
		},
		[EditorPanelNodeSelectorMutation.CLOSE]: (state: EditorPanelNodeSelectorState) => {
			state.param_id = null;
		},
	},
};
