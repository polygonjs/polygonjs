/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let component;
import Vue from 'vue';

export default component = {
	namespaced: true,
	state() {
		return {node_ids_being_moved: []};
	},

	getters: {
		node_ids_being_moved(state){ return state.node_ids_being_moved; }
	},

	mutations: {
		node_ids_being_moved(state, payload){
			return Vue.set(state, 'node_ids_being_moved', payload);
		},
		reset_node_ids_being_moved(state){
			return Vue.set(state, 'node_ids_being_moved', []);
		}
	}
};


