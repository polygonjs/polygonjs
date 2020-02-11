import {CoreEvent} from 'src/Core/Event'

export default component =

	methods:
		open_numeric_slider: (e)->
			
			if event.button == CoreEvent.MOUSE_BUTTON_MIDDLE

				this.$store.commit 'editor/numeric_slider/open',
					param_id: this.json_param?.graph_node_id
					position: [e.clientX, e.clientY]

				e.preventDefault() # to prevent paste into field

		on_paste: (e)->
			# to prevent paste into field
			param_id = this.$store.getters['editor/numeric_slider/param_id']
			if param_id?
				e.preventDefault()



