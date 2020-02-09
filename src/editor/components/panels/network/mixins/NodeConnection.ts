import {ConnectionHelper} from '../Helpers/Connection';
import {Constants} from '../Helpers/Constants';

const PADDING = 5;

export const NodeConnection = {
	data() {
		return {
			connection: {
				node_src_id: null,
				node_dest_id: null,
				input_index: null,
				output_index: null,
				mouse_start: {x: 0, y: 0},
				mouse_progress: {x: 0, y: 0},
				active: false,
			},
		};
	},

	mounted() {
		this.connection_helper.set_element(this.$refs.nodes_container);
		// this.set_connection_helper_node()
	},

	computed: {
		connection_helper(): ConnectionHelper {
			return (this._connection_helper =
				this._connection_helper || new ConnectionHelper(this, this.connection, this.camera));
		},
		connection_src_json_node() {
			const id = this.connection.node_src_id;
			if (id) {
				return this.$store.getters['engine/json_node'](this.connection.node_src_id);
			}
		},
		connection_dest_json_node() {
			const id = this.connection.node_dest_id;
			if (id) {
				return this.$store.getters['engine/json_node'](this.connection.node_dest_id);
			}
		},

		// node_connection_line_style_object(): object {
		// 	const display = this.connection_line.active ? 'block' : 'none'
		// 	const size = Constants.NODE_UNIT
		// 	return {
		// 		display: `${display}`,
		// 		left: `${this.connection_line.position.x}px`,
		// 		top: `${this.connection_line.position.y}px`,
		// 		width: `${size}px`,
		// 		height: `${size}px`
		// 	}
		// }

		// connection_line_svg_style_object(){
		// 	return {
		// 		left: `${this.svg_src_point.x-PADDING}px`,
		// 		top: `${this.svg_src_point.y-PADDING}px`,
		// 		width: `${this.size.x + 2*PADDING}px`,
		// 		height: `${this.size.y + 2*PADDING}px`
		// 	}
		// },
		// connection_line_container_style_object(){
		// 	const zoom = this.camera.zoom
		// 	// const zoom_inverse = (1/this.camera.zoom)
		// 	const display = this.connection_line.active ? 'block' : 'none'
		// 	return {
		// 		display: display,
		// 		left: `${-zoom*this.camera.position.x}px`,
		// 		top: `${-zoom*this.camera.position.y}px`,
		// 		transform: `scale(${this.camera.zoom})`
		// 	}
		// },

		// connection_line_start_point(){
		// 	if(this.connection_line.node_src_id){
		// 		const json_node = this.$store.getters['engine/json_node'](this.connection_line.node_src_id)
		// 		const pos = json_node.ui_data

		// 		return {
		// 			x: (0.5 * Constants.NODE_UNIT + pos.x) + this.camera.position.x,
		// 			y: (4+10+ Constants.NODE_UNIT + pos.y) + this.camera.position.y
		// 		}
		// 	} else {
		// 		if(this.connection_line.node_dest_id){
		// 			const json_node = this.$store.getters['engine/json_node'](this.connection_line.node_dest_id)
		// 			const pos = json_node.ui_data

		// 			return {
		// 				x: (0.5 * Constants.NODE_UNIT + pos.x) + this.camera.position.x,
		// 				y: (-4-10+ 0*Constants.NODE_UNIT + pos.y) + this.camera.position.y
		// 			}
		// 		} else {
		// 			return {
		// 				x: 0,
		// 				y: 0
		// 			}
		// 		}
		// 	}
		// },
		// connection_line_end_point(){
		// 	return {
		// 		x: this.connection_line.end_pos.x,
		// 		y: this.connection_line.end_pos.y
		// 	}
		// }
	},

	// watch: {
	// 	json_node(){
	// 		this.$nextTick(() => {
	// 			this.set_connection_helper_node()
	// 		});
	// 	}
	// },
	// methods: {
	// 	set_connection_helper_node(){
	// 		this.connection_helper.set_parent_node(this.node)
	// 	}
	// }
};
