import {State} from '../../Store';
import {Store} from 'vuex';
import {
	EditorNumericSliderMutation,
	EditorNumericSliderShowOptions,
	EditorNumericSliderState,
} from '../../modules/editor/NumericSlider';

export class EditorNumericSliderStoreControllerClass {
	private _store!: Store<State>;

	private static _instance: EditorNumericSliderStoreControllerClass;
	static instance() {
		return (this._instance = this._instance || new EditorNumericSliderStoreControllerClass());
	}

	private constructor() {}

	set_store(store: Store<State>) {
		this._store = store;
	}

	// getters
	get local_state(): EditorNumericSliderState {
		return (<unknown>(this._store.state.editor as any).dialog_prompt) as EditorNumericSliderState;
	}
	param_id(): string | null {
		return this.local_state.param_id;
	}
	position(): Vector2Like {
		return this.local_state.position;
	}

	// mutations
	open(options: EditorNumericSliderShowOptions): void {
		this._store.commit(`editor/numeric_slider/${EditorNumericSliderMutation.OPEN}`, options);
	}
	close() {
		this._store.commit(`editor/numeric_slider/${EditorNumericSliderMutation.CLOSE}`);
	}
}

export const EditorNumericSliderStoreController = EditorNumericSliderStoreControllerClass.instance();
