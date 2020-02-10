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
		return {
			param_id: null,
			position: [0,0]
		};
	},

	getters: {
		param_id(state){ return state.param_id; },
		position(state){ return state.position; }
	},


	mutations: {
		open(state, payload){
			state.param_id = payload.param_id;
			return state.position = payload.position;
		},
		close(state){
			return state.param_id = null;
		}
	}
};


