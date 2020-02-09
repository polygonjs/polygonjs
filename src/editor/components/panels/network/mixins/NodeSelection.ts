import {Vector2} from 'three/src/math/Vector2';
const THREE = {Vector2};
import {NodeSelectionHelper} from '../Helpers/NodeSelection';

export const NodeSelection = {
	data() {
		return {
			selection: {
				start: {x: 0, y: 0},
				end: {x: 0, y: 0},
				active: false,
			},
		};
	},

	mounted() {
		this.node_selection_helper.set_element(this.$refs.nodes_container);
		this.set_selection_helper_node();
	},

	computed: {
		node_selection_helper(): NodeSelectionHelper {
			return (this._node_selection_helper =
				this._node_selection_helper || new NodeSelectionHelper(this, this.selection, this.camera));
		},

		selection_rectangle_style_object(): object {
			const box = this.node_selection_helper.box();
			const size = new THREE.Vector2();
			box.getSize(size);
			const display = this.selection.active ? 'block' : 'none';
			return {
				display: `${display}`,
				left: `${box.min.x}px`,
				top: `${box.min.y}px`,
				width: `${size.x}px`,
				height: `${size.y}px`,
			};
		},
	},

	watch: {
		json_node() {
			this.$nextTick(() => {
				this.set_selection_helper_node();
			});
		},
	},
	methods: {
		set_selection_helper_node() {
			this.node_selection_helper.set_parent_node(this.node);
		},
	},
};
