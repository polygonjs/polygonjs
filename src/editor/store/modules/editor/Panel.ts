export interface EditorPanelState {
	fullscreen_panel_id: string | null;
}

export enum EditorPanelMutation {
	FULLSCREEN_PANEL_ID = 'FULLSCREEN_PANEL_ID',
}

export const EditorPanelStateModule = {
	namespaced: true,
	state(): EditorPanelState {
		return {
			fullscreen_panel_id: null,
		};
	},

	mutations: {
		[EditorPanelMutation.FULLSCREEN_PANEL_ID]: (state: EditorPanelState, payload: string) => {
			state.fullscreen_panel_id = payload;
		},
	},
};
