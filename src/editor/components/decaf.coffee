import Vue from 'vue'

export default component =
	namespaced: true
	state: ->
		node_ids_being_moved: []

	getters:
		node_ids_being_moved: (state)-> state.node_ids_being_moved

	mutations:
		node_ids_being_moved: (state, payload)->
			Vue.set(state, 'node_ids_being_moved', payload)
		reset_node_ids_being_moved: (state)->
			Vue.set(state, 'node_ids_being_moved', [])


