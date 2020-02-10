import {Helpers} from './EventMouse';
import {SetDisplayFlagCommand} from 'src/editor/history/commands/SetDisplayFlag';
import {SetBypassFlagCommand} from 'src/editor/history/commands/SetBypassFlag';
import {StoreController} from 'src/editor/store/controllers/StoreController';

export function SetupNodeEvent(helpers: Helpers) {
	const {node_animation_helper, connection_helper} = helpers;

	function on_capture_node_for_move(id: string) {
		node_animation_helper.capture_node(id);
	}
	// function on_capture_node_for_selection(node: BaseNodeType) {
	// 	this.debug_node_infos(node);

	// 	node_selection_helper.capture_node(node);
	// }

	function on_capture_node_src_for_connection(id: string, index: number) {
		connection_helper.capture_node_src(id, index);
	}
	function on_capture_node_dest_for_connection(id: string, index: number) {
		connection_helper.capture_node_dest(id, index);
	}
	function on_capture_node_final_for_connection(id: string) {
		connection_helper.capture_node_final(id);
	}
	function on_set_display_flag(id: string) {
		const node = StoreController.engine.node(id)!;
		const current_node = StoreController.editor.current_node();
		if (current_node && current_node.children_allowed() && current_node.children_controller) {
			const selection = current_node.children_controller.selection;
			const nodes = selection.contains(node) ? selection.nodes() : [node];

			const cmd = new SetDisplayFlagCommand(nodes);
			cmd.push();
		}
	}
	function on_set_bypass_flag(id: string) {
		const node = StoreController.engine.node(id)!;
		const current_node = StoreController.editor.current_node();
		if (current_node && current_node.children_allowed() && current_node.children_controller) {
			const selection = current_node.children_controller.selection;
			const nodes = selection.contains(node) ? selection.nodes() : [node];

			const cmd = new SetBypassFlagCommand(nodes);
			cmd.push();
		}
	}

	return {
		on_capture_node_for_move,
		on_capture_node_src_for_connection,
		on_capture_node_dest_for_connection,
		on_capture_node_final_for_connection,
		on_set_display_flag,
		on_set_bypass_flag,
	};
}
