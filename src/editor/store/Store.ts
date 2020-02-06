import {EngineStoreModule} from './modules/Engine';
import Vuex from 'vuex';

EngineStoreModule.state;

export const store = new Vuex.Store({
	modules: {
		engine: EngineStoreModule,
	},
});
