export type EditorDialogConfirmOnAcceptCallback = () => void;
export interface EditorDialogConfirmState {
	display: boolean;
	question: string;
	accept_label: string;
	on_accept: EditorDialogConfirmOnAcceptCallback | undefined;
}
export interface EditorDialogConfirmShowOptions {
	question: string;
	accept_label: string;
}
export interface EditorDialogConfirmShowOptionsWithCallback extends EditorDialogConfirmShowOptions {
	on_accept: EditorDialogConfirmOnAcceptCallback;
}
export enum EditorDialogConfirmMutation {
	SHOW = 'SHOW',
	HIDE = 'HIDE',
}

export const EditorDialogConfirmStateModule = {
	namespaced: true,
	state(): EditorDialogConfirmState {
		return {
			display: false,
			question: 'Are you Sure?',
			accept_label: 'Delete',
			on_accept: undefined,
		};
	},

	// getters: {
	// 	display(state) {
	// 		return state.display;
	// 	},
	// 	question(state) {
	// 		return state.question;
	// 	},
	// 	accept_label(state) {
	// 		return state.accept_label;
	// 	},
	// },

	mutations: {
		[EditorDialogConfirmMutation.SHOW]: (
			state: EditorDialogConfirmState,
			payload: EditorDialogConfirmShowOptionsWithCallback
		) => {
			state.question = payload.question;
			state.accept_label = payload.accept_label;
			state.on_accept = payload.on_accept;
			state.display = true;
		},

		[EditorDialogConfirmMutation.HIDE]: (state: EditorDialogConfirmState) => {
			state.display = false;
			state.on_accept = undefined;
		},
	},
};
