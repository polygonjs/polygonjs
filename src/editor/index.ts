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
import {EditorStore} from './store/Store';
import {StoreController} from './store/controllers/StoreController';
if (EditorStore) {
	StoreController.set_store(EditorStore);
} else {
	console.warn('store not ready for StoreController');
}

// icons
import './components/Icons';

// to ensure that .vue components are loaded, see tips in webpack config
// the still remaining issue is that when the file path is wrong, there is no warning in the editor
// and the error message can be confusing
import Editor from './components/editor/Editor.vue';

import 'src/engine/poly/registers/All';

import {SceneJsonExporterData} from 'src/engine/io/json/export/Scene';
import {SceneJsonImporter} from 'src/engine/io/json/import/Scene';
import {PolyScene} from 'src/engine/scene/PolyScene';
import default_scene_data from 'src/../public/examples/scenes/default_simple2.json';
async function load_default_scene_if_none() {
	const default_scene: PolyScene = await SceneJsonImporter.load_data(default_scene_data as SceneJsonExporterData);
	StoreController.set_scene(default_scene);
	(window as any).scene = default_scene;
	new Vue({
		el: '#app',
		store: EditorStore,
		render: (createElement) => {
			return createElement(Editor);
		},
	});
}
load_default_scene_if_none();
