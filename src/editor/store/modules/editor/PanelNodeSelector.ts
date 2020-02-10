export interface EditorPanelNodeSelectorState {
	panel_id: string | null;
}
export interface EditorPanelNodeSelectorOptions {
	panel_id: string;
}
export enum EditorPanelNodeSelectorMutation {
	OPEN = 'OPEN',
	CLOSE = 'CLOSE',
}

export const EditorPanelNodeSelectorStateModule = {
	namespaced: true,
	state(): EditorPanelNodeSelectorState {
		return {panel_id: null};
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
			state.panel_id = payload.panel_id;
		},
		[EditorPanelNodeSelectorMutation.CLOSE]: (state: EditorPanelNodeSelectorState) => {
			state.panel_id = null;
		},
	},
};
