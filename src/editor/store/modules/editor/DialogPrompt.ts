export type EditorDialogPromptSaveCallback = (new_val: string) => void;
export interface EditorDialogPromptState {
	display: boolean;
	title: string;
	default_value: string;
	confirm_label: string;
	on_save: EditorDialogPromptSaveCallback | undefined;
}
export enum EditorDialogPromptMutation {
	SHOW = 'SHOW',
	HIDE = 'HIDE',
}
export interface EditorDialogPromptShowOptions {
	title: string;
	default_value: string;
	confirm_label: string;
}
export interface EditorDialogPromptShowOptionsWithCallback extends EditorDialogPromptShowOptions {
	on_save: EditorDialogPromptSaveCallback | undefined;
}

export const EditorDialogPromptStateModule = {
	namespaced: true,
	state(): EditorDialogPromptState {
		return {
			display: false,
			title: '',
			default_value: '',
			confirm_label: 'ok',
			on_save: undefined,
		};
	},

	// getters: {
	// 	display(state) {
	// 		return state.display;
	// 	},
	// 	title(state) {
	// 		return state.title;
	// 	},
	// 	default_value(state) {
	// 		return state.default_value;
	// 	},
	// 	confirm_label(state) {
	// 		return state.confirm_label;
	// 	},
	// },

	mutations: {
		[EditorDialogPromptMutation.SHOW]: (
			state: EditorDialogPromptState,
			payload: EditorDialogPromptShowOptionsWithCallback
		) => {
			state.title = payload.title;
			state.default_value = payload.default_value;
			state.confirm_label = payload.confirm_label;
			state.on_save = payload.on_save;
			state.display = true;
		},

		[EditorDialogPromptMutation.HIDE]: (state: EditorDialogPromptState) => {
			state.display = false;
			state.on_save = undefined;
		},
	},
};
