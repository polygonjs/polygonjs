type OnCloseCallback = () => void;
export interface EditorDialogAlertState {
	display: boolean;
	message: string;
	title: string;
	on_close: OnCloseCallback | undefined;
}
export interface EditorDialogAlertShowOptions {
	message: string;
	title: string;
}
export interface EditorDialogAlertShowOptionsWithCallback extends EditorDialogAlertShowOptions {
	on_close: OnCloseCallback;
}
export enum EditorDialogAlertMutation {
	SHOW = 'SHOW',
	HIDE = 'HIDE',
}

export const EditorDialogAlertStateModule = {
	namespaced: true,
	state(): EditorDialogAlertState {
		return {
			display: false,
			message: '',
			title: 'Alert',
			on_close: undefined,
		};
	},

	// getters: {
	// 	display(state) {
	// 		return state.display;
	// 	},
	// 	message(state) {
	// 		return state.message;
	// 	},
	// 	title(state) {
	// 		return state.title;
	// 	},
	// },

	mutations: {
		[EditorDialogAlertMutation.SHOW]: (
			state: EditorDialogAlertState,
			payload: EditorDialogAlertShowOptionsWithCallback
		) => {
			state.message = payload.message;
			state.title = payload.title || 'Alert';
			state.display = true;
			state.on_close = payload.on_close;
		},

		[EditorDialogAlertMutation.HIDE]: (state: EditorDialogAlertState) => {
			state.display = false;
		},
	},
};
