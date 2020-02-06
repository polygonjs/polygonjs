import Vue from 'vue';

// Vue composition api
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);

// from https://github.com/vuejs/composition-api README
declare module '@vue/composition-api/dist/component/component' {
	interface SetupContext {
		readonly refs: {[key: string]: Vue | Element | Vue[] | Element[]};
	}
}
Vue.config.productionTip = false;

// Vuex
import Vuex from 'vuex';
Vue.use(Vuex);
import {store} from './store/Store';
import {StoreController} from './store/StoreController';
if (store) {
	StoreController.set_store(store);
} else {
	console.warn('store not ready for StoreController');
}

// icons
import './components/Icons';

// to ensure that .vue components are loaded, see tips in webpack config
// the still remaining issue is that when the file path is wrong, there is no warning in the editor
// and the error message can be confusing
import Editor from './components/editor/Editor.vue';

new Vue({
	el: '#app',
	store: store,
	render: (createElement) => {
		return createElement(Editor);
	},
});
