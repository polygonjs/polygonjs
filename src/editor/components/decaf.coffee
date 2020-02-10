import Vue from 'vue'

export default component =
	namespaced: true
	state: ->
		param_id: null
		position: [0,0]

	getters:
		param_id: (state)-> state.param_id
		position: (state)-> state.position


	mutations:
		open: (state, payload)->
			state.param_id = payload.param_id
			state.position = payload.position
		close: (state)->
			state.param_id = null


