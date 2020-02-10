// import EventHelper from '../../Helper/Event';
import {MouseButton} from 'src/editor/core/MouseButton';

import {StoreController} from 'src/editor/store/controllers/StoreController';
import {NodeSetNameCommand} from 'src/editor/history/commands/NodeSetName';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {SetupCaptureOptions} from './Capture';
import {SetupContext} from '@vue/composition-api';
import {SetupInfosOptions} from './Infos';
export function SetupEventMouse(
	json_node: EngineNodeData,
	context: SetupContext,
	capture_options: SetupCaptureOptions,
	infos_options: SetupInfosOptions
) {
	function on_body_mousedown(event: MouseEvent) {
		switch (event.button) {
			case MouseButton.LEFT:
				capture_options.capture_node_for_move();
				break;
			case MouseButton.MIDDLE:
				infos_options.display_info();
				event.stopPropagation();
				break;

			// case Core.Event.MOUSE_BUTTON_MIDDLE:
			// 	this.cam_animation_helper.pan_start(event);
			// 	this.pan_in_progress = true;
			// 	break

			// case Core.Event.MOUSE_BUTTON_RIGHT:
			// 	this.cam_animation_helper.zoom_start(event);
			// 	this.zoom_in_progress = true;
			// 	break
		}
	}
	function on_body_mouseup(event: MouseEvent) {
		if (event.button == MouseButton.MIDDLE) {
			infos_options.hide_info();
		} else {
			capture_options.capture_node_final_for_connection();
		}
	}

	// on_body_click(event: MouseEvent){
	// 	console.log("click")
	// },
	function on_body_dblclick(event: MouseEvent) {
		open_node();
	}
	function open_node() {
		const node = StoreController.engine.node(json_node.graph_node_id);
		if (node) {
			StoreController.editor.set_current_node(node);
		}
	}
	// on_click() {
	// 	this.close_tab_menu();
	// },
	// on_context_menu(event: MouseEvent){
	// 	//this.toggle_tab_menu()
	// 	//event.stopPropagation()
	// 	return false;
	// }

	function on_input_mousedown(event: MouseEvent, index: number) {
		capture_options.capture_node_dest_for_connection(index);
	}
	function on_input_mouseup(event: MouseEvent, index: number) {
		capture_options.capture_node_dest_for_connection(index);
	}
	function on_output_mousedown(event: MouseEvent, index: number) {
		capture_options.capture_node_src_for_connection(index);
	}
	function on_output_mouseup(event: MouseEvent, index: number) {
		capture_options.capture_node_src_for_connection(index);
	}
	function on_display_flag_click() {
		context.emit('set_display_flag', json_node.graph_node_id);
	}
	function on_bypass_flag_click() {
		context.emit('set_bypass_flag', json_node.graph_node_id);
	}

	async function on_name_click() {
		const new_name: string = await StoreController.editor.dialog_prompt.show({
			title: 'Rename Node:',
			default_value: json_node.name,
			confirm_label: 'Update Name',
		});
		// const new_name = await window.POLY_prompt(this, 'Rename Node:', this.node.name(), {options: 'Update Name'});

		if (new_name != null && new_name.length > 0) {
			const node = StoreController.engine.node(json_node.graph_node_id) as BaseNodeType;
			if (node) {
				const cmd = new NodeSetNameCommand(node, new_name);
				cmd.push();
			}
		}
	}
	function on_name_mouseup() {
		// this is only here to prevent selection from being cleared
		// when clicking on the name to rename a node
	}

	return {
		on_body_mousedown,
		on_body_mouseup,
		on_body_dblclick,
		on_input_mousedown,
		on_input_mouseup,
		on_output_mousedown,
		on_output_mouseup,
		on_display_flag_click,
		on_bypass_flag_click,
		on_name_click,
		on_name_mouseup,
		open_node,
	};
}
