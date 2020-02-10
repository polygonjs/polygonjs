import {State} from '../../Store';
import {Store} from 'vuex';
import {
	EditorDialogAlertMutation,
	EditorDialogAlertShowOptions,
	EditorDialogAlertShowOptionsWithCallback,
	EditorDialogAlertState,
} from '../../modules/editor/DialogAlert';

export class EditorDialogAlertStoreControllerClass {
	private _store!: Store<State>;

	private static _instance: EditorDialogAlertStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorDialogAlertStoreControllerClass());
	}

	private constructor() {}

	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	get local_state(): EditorDialogAlertState {
		return (<unknown>(this._store.state.editor as any).dialog_Alert) as EditorDialogAlertState;
	}
	display(): boolean {
		return this.local_state.display;
	}
	title(): string {
		return this.local_state.title;
	}
	message(): string {
		return this.local_state.message;
	}

	// mutations
	async show(options: EditorDialogAlertShowOptions): Promise<void> {
		return new Promise((resolve, reject) => {
			const options_with_callback: EditorDialogAlertShowOptionsWithCallback = {
				title: options.title,
				message: options.message,
				on_close: resolve,
			};
			this._store.commit(`editor/dialog_alert/${EditorDialogAlertMutation.SHOW}`, options_with_callback);
		});

		// window.POLY_alert = (component, message, options) => {
		// 	return new Promise((resolve, reject) => {
		// 		return component.$store.commit('editor/dialog_alert/show', {
		// 			message,
		// 			title: options['title'],
		// 			on_close: (new_value) => {
		// 				return resolve();
		// 			},
		// 		});
		// 	});
		// };
	}
	hide() {
		this._store.commit(`editor/dialog_alert/${EditorDialogAlertMutation.HIDE}`);
	}
}

export const EditorDialogAlertStoreController = EditorDialogAlertStoreControllerClass.instance();
