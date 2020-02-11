/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let component;
import {CoreEvent} from 'src/Core/Event';

export default component = {

	methods: {
		open_numeric_slider(e){
			
			if (event.button === CoreEvent.MOUSE_BUTTON_MIDDLE) {

				this.$store.commit('editor/numeric_slider/open', {
					param_id: (this.json_param != null ? this.json_param.graph_node_id : undefined),
					position: [e.clientX, e.clientY]
				});

				return e.preventDefault();
			}
		}, // to prevent paste into field

		on_paste(e){
			// to prevent paste into field
			const param_id = this.$store.getters['editor/numeric_slider/param_id'];
			if (param_id != null) {
				return e.preventDefault();
			}
		}
	}
};



