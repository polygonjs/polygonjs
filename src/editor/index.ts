import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);
// from https://github.com/vuejs/composition-api README
declare module '@vue/composition-api/dist/component/component' {
	interface SetupContext {
		readonly refs: {[key: string]: Vue | Element | Vue[] | Element[]};
	}
}
Vue.config.productionTip = false;

import Editor from './Editor.vue';
new Vue({
	el: '#app',
	render: (createElement) => {
		return createElement(Editor);
	},
});

// const stylesheet = document.createElement('style');
// stylesheet.innerText = 'html, body, canvas, .canvas_container {height: 100%; margin: 0px;} canvas {display: block;}';
// document.body.appendChild(stylesheet);
// const container = document.createElement('div');
// container.id = 'app';
// document.body.appendChild(container);

// createApp(Editor).mount('#app');
