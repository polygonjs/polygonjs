import {State} from '../../Store';
import {Store} from 'vuex';
import {
	EditorDialogPromptMutation,
	EditorDialogPromptShowOptions,
	EditorDialogPromptShowOptionsWithCallback,
	EditorDialogPromptState,
	EditorDialogPromptSaveCallback,
} from '../../modules/editor/DialogPrompt';

export class EditorDialogPromptStoreControllerClass {
	private _store!: Store<State>;

	private static _instance: EditorDialogPromptStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorDialogPromptStoreControllerClass());
	}

	private constructor() {}

	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	get local_state(): EditorDialogPromptState {
		return (<unknown>(this._store.state.editor as any).dialog_prompt) as EditorDialogPromptState;
	}
	display(): boolean {
		return this.local_state.display;
	}
	title(): string {
		return this.local_state.title;
	}
	default_value(): string {
		return this.local_state.default_value;
	}
	confirm_label(): string {
		return this.local_state.confirm_label;
	}
	on_save(): EditorDialogPromptSaveCallback | undefined {
		return this.local_state.on_save;
	}

	// mutations
	async show(options: EditorDialogPromptShowOptions): Promise<string> {
		return new Promise((resolve, reject) => {
			const options_with_callback: EditorDialogPromptShowOptionsWithCallback = {
				title: options.title,
				confirm_label: options.confirm_label,
				default_value: options.default_value,
				on_save: resolve,
			};
			this._store.commit(`editor/dialog_prompt/${EditorDialogPromptMutation.SHOW}`, options_with_callback);
		});

		// window.POLY_confirm = (component, question, options) => {
		// 	if (options == null) {
		// 		options = {};
		// 	}
		// 	options['accept_label'] = options['accept_label'] || 'Delete';

		// 	return new Promise((resolve, reject) => {
		// 		return component.$store.commit('editor/dialog_confirm/show', {
		// 			question,
		// 			accept_label: options['accept_label'],
		// 			on_accept: () => {
		// 				return resolve(true);
		// 			},
		// 		});
		// 	});
		// };
	}
	hide() {
		this._store.commit(`editor/dialog_prompt/${EditorDialogPromptMutation.HIDE}`);
	}
}

export const EditorDialogPromptStoreController = EditorDialogPromptStoreControllerClass.instance();
