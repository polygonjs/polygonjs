import {BaseNode} from 'src/Engine/Node/_Base';
import History from 'src/Editor/History/_Module';

export const NodeEvent = {
	methods: {
		on_capture_node_for_move(node: BaseNode) {
			this.node_animation_helper.capture_node(node);
		},
		on_capture_node_for_selection(node: BaseNode) {
			this.debug_node_infos(node);

			this.node_selection_helper.capture_node(node);
		},

		on_capture_node_src_for_connection(node: BaseNode, index: number) {
			this.connection_helper.capture_node_src(node, index);
		},
		on_capture_node_dest_for_connection(node: BaseNode, index: number) {
			this.connection_helper.capture_node_dest(node, index);
		},
		on_capture_node_final_for_connection(node: BaseNode) {
			this.connection_helper.capture_node_final(node);
		},
		on_set_display_flag(node: BaseNode) {
			const selection = this.node.selection();
			const nodes = selection.contains(node) ? selection.nodes() : [node];

			const cmd = new History.Command.SetDisplayFlag(nodes);
			cmd.push(this);
		},
		on_set_bypass_flag(node: BaseNode) {
			const selection = this.node.selection();
			const nodes = selection.contains(node) ? selection.nodes() : [node];

			const cmd = new History.Command.SetBypassFlag(nodes);
			cmd.push(this);
		},
	},
};
