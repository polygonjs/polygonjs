

export default component =

	mounted: ->
		this.unblock_param_emit()
	beforeDestroy: ->
		this.block_param_emit()

	# watch:
	# 	graph_node_id: (new_graph_node_id, old_graph_node_id)->
	# 		console.log("graph_node_id change", new_graph_node_id, old_graph_node_id)
	# 		#console.log("first_selected_node change", new_node)
	# 		#old_node?.block_param_emit()
	# 		#new_node?.unblock_param_emit()

	watch:
		json_param: (new_json_param, old_json_param)->
			graph = this.$store.scene.graph()
			new_param = graph.node_from_id(this.new_json_param?.graph_node_id)
			old_param = graph.node_from_id(this.old_json_param?.graph_node_id)
			if new_param
				this.unblock_param_emit(new_param)
			if old_param
				this.block_param_emit(old_param)

	methods:
		block_param_emit: (param)->
			param ?= @param
			# console.log("block", @param.full_path())
			param.block_emit()

		unblock_param_emit: (param)->
			param ?= @param
			# console.log("unblock", @param.full_path())
			param.unblock_emit()
			param.emit_param_updated() # TODO: that should be replaced by querying the node if it is dirty

			# emitting for the components is currently a little redundant as it also creates an emit for the parent each time, but that's the only way I have for now to ensure that the component of an expression will be updated accordingly in the store
			if param.is_multiple()
				param.components().forEach (c)=>
					c.emit_param_updated()