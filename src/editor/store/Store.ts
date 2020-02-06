import Vuex from 'vuex';

import {EngineStoreModule, EngineState} from './modules/Engine';
import {EditortoreModule, EditorState} from './modules/Editor';

export interface State {
	engine: EngineState;
	editor: EditorState;
}

export const store = new Vuex.Store<State>({
	modules: {
		engine: EngineStoreModule,
		editor: EditortoreModule,
	},
});
