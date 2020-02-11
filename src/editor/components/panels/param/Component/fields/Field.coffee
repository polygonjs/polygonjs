# internal lib
import History from 'src/Editor/History/_Module'

export default component =
	
	props:
		json_param: {}
		displays_expression_result: false

	computed:
		param: ->
			this.$store.scene.graph().node_from_id(this.json_param?.graph_node_id)
		name: ->
			this.json_param.name


		value: ->
			this.json_param.value
		expression: ->
			this.json_param.expression
		result: ->
			this.json_param.result
		value_or_expression: ->
			this.expression || this.value
		has_expression: ->
			this.expression?
		error_message: ->
			this.json_param.error_message
		is_errored: ->
			this.error_message?
		is_dirty: ->
			this.json_param.is_dirty

		field_component_type: ->
			this.json_param.type

		class_object: ->

			# TODO: no idea why this gets called forever for a string
			if this.param.displays_expression_only()
				if this.is_dirty
					this.param.eval (value)=>
						console.log(value, this.json_param.result)
				object =
					displays_expression_result: true
					displays_expression_only: true
			else
				displays_expression_result: this.displays_expression_result

		input_value_class_object: ->
			has_expression: this.has_expression
			is_errored: this.is_errored

		is_field_visible: ->
			!this.param.is_field_hidden()

	watch:
		displays_expression_result: (new_display, old_display)->
			if new_display
				this.param.eval (value)=>
					#

	methods:
		on_update_value: (e)->
			new_value = e.target.value
			
			if this.param.is_value_expression(new_value)
				(new History.Command.ParamSet(this.param, {expression: new_value})).push(this)
			else
				(new History.Command.ParamSet(this.param, {value: new_value})).push(this)

		on_wheel: (e)->
			return if this.has_expression

			down = event.deltaY > 0
			offset = 0.1
			if down
				offset *= -1
			this.param.set( this.value + offset )
			# TODO: how can I generate a command only when the mouse wheel has stopped?

		reset_to_default: ->
			# TODO: why reseting to default does not seem to be undoable??
			v = this.param.default_value()
			(new History.Command.ParamSet(this.param, {value: v})).push(this)
