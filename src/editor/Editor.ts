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
import EditorComponent from './components/editor/Editor.vue';

import 'src/engine/poly/registers/All';

import {SceneJsonExporterData} from 'src/engine/io/json/export/Scene';
import {SceneJsonImporter} from 'src/engine/io/json/import/Scene';
import {PolyScene} from 'src/engine/scene/PolyScene';

type OnSaveCallback = (json: SceneJsonExporterData) => void;

export class Editor {
	static _instance: Editor;
	private _loaded: boolean = false;
	private _on_save_callback: OnSaveCallback | undefined;
	private constructor() {}
	static instance() {
		return (this._instance = this._instance || new Editor());
	}

	static async load_scene(element_or_id: HTMLElement | string, json: SceneJsonExporterData) {
		return await this.instance().load_scene(element_or_id, json);
	}
	static on_save(callback: OnSaveCallback) {
		this.instance().set_on_save_callback(callback);
	}

	set_on_save_callback(callback: OnSaveCallback) {
		this._on_save_callback = callback;
	}
	get on_save_callback() {
		return this._on_save_callback;
	}

	async load_scene(
		element_or_id: HTMLElement | string,
		json: SceneJsonExporterData,
		scene_update_allowed: boolean = true
	) {
		if (this._loaded) {
			return;
		}
		this._loaded = true;

		const scene: PolyScene = await SceneJsonImporter.load_data(json);
		StoreController.set_scene(scene);
		(window as any).scene = scene;

		new Vue({
			el: element_or_id,
			store: EditorStore,
			render: (createElement, props) => {
				return createElement(EditorComponent, {
					props: {
						scene_update_allowed: scene_update_allowed,
					},
				});
			},
		});
	}
}
