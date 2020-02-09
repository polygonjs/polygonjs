import {NodeAnimationHelper} from '../Helpers/NodeAnimation';

export const NodeAnimation = {
	mounted() {
		this.node_animation_helper.set_element(this.$refs.nodes_container);
		// this.set_animation_helper_node()
	},

	computed: {
		node_animation_helper(): NodeAnimationHelper {
			return (this._node_animation_helper =
				this._node_animation_helper || new NodeAnimationHelper(this, this.camera));
		},
	},

	// watch: {
	// 	json_node(){
	// 		this.$nextTick(() => {
	// 			this.set_animation_helper_node()
	// 		});
	// 	}
	// },

	// methods: {
	// 	// set_animation_helper_node(){
	// 	// 	this.node_animation_helper.set_parent_node(this.node)
	// 	// }
	// }
};
