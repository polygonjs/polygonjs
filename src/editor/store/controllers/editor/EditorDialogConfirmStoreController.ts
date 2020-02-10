import {State} from '../../Store';
import {Store} from 'vuex';
import {
	EditorDialogConfirmMutation,
	EditorDialogConfirmShowOptions,
	EditorDialogConfirmShowOptionsWithCallback,
	EditorDialogConfirmState,
	EditorDialogConfirmOnAcceptCallback,
} from '../../modules/editor/DialogConfirm';

export class EditorDialogConfirmStoreControllerClass {
	private _store!: Store<State>;

	private static _instance: EditorDialogConfirmStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorDialogConfirmStoreControllerClass());
	}

	private constructor() {}

	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	get local_state(): EditorDialogConfirmState {
		return (<unknown>(this._store.state.editor as any).confirm) as EditorDialogConfirmState;
	}
	display(): boolean {
		return this.local_state.display;
	}
	question(): string {
		return this.local_state.question;
	}
	accept_label(): string {
		return this.local_state.accept_label;
	}
	on_accept(): EditorDialogConfirmOnAcceptCallback | undefined {
		return this.local_state.on_accept;
	}

	// mutations
	async show(options: EditorDialogConfirmShowOptions): Promise<string> {
		return new Promise((resolve, reject) => {
			const options_with_callback: EditorDialogConfirmShowOptionsWithCallback = {
				question: options.question,
				accept_label: options.accept_label,
				on_accept: resolve,
			};
			this._store.commit(`editor/dialog_confirm/${EditorDialogConfirmMutation.SHOW}`, options_with_callback);
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
		this._store.commit(`editor/dialog_prompt/${EditorDialogConfirmMutation.HIDE}`);
	}
}

export const EditorDialogConfirmStoreController = EditorDialogConfirmStoreControllerClass.instance();
