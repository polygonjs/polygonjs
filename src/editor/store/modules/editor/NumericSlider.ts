export interface EditorNumericSliderState {
	param_id: string | null;
	position: Vector2Like;
}
export interface EditorNumericSliderShowOptions {
	param_id: string | null;
	position: Vector2Like;
}
export enum EditorNumericSliderMutation {
	OPEN = 'OPEN',
	CLOSE = 'CLOSE',
}

export const EditorNumericSliderStateModule = {
	namespaced: true,
	state() {
		return {
			param_id: null,
			position: {x: 0, y: 0},
		};
	},

	// getters: {
	// 	param_id(state) {
	// 		return state.param_id;
	// 	},
	// 	position(state) {
	// 		return state.position;
	// 	},
	// },

	mutations: {
		[EditorNumericSliderMutation.OPEN]: (
			state: EditorNumericSliderState,
			payload: EditorNumericSliderShowOptions
		) => {
			state.param_id = payload.param_id;
			state.position.x = payload.position.x;
			state.position.y = payload.position.y;
		},

		[EditorNumericSliderMutation.CLOSE]: (state: EditorNumericSliderState) => {
			state.param_id = null;
		},
	},
};
