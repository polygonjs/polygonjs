import {ClipBoardHelper} from '../helpers/ClipBoard';
import {NodeDeleteCommand} from 'src/editor/history/commands/NodeDelete';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {CameraAnimationHelper} from '../helpers/CameraAnimation';
import {TabMenuOptions} from './TabMenuOwner';

export function SetupEventKey(
	clipboard_helper: ClipBoardHelper,
	cam_animation_helper: CameraAnimationHelper,
	tab_menu_options: TabMenuOptions
) {
	function on_key_press(event: KeyboardEvent) {
		return false;
	}
	// better to have Tab on key down,
	// otherwise, it gets detected when switching windows with alt+tab
	function on_key_down(event: KeyboardEvent): boolean {
		let key_processed = true;
		if (event.ctrlKey) {
			switch (event.key) {
				case 'x':
					cut();
					break;
				case 'c':
					copy();
					break;
				case 'v':
					paste();
					break;
				default:
					key_processed = false;
			}
		} else {
			switch (event.key) {
				case 'Delete':
					delete_selected_nodes();
					break;
				case 'f':
					cam_animation_helper.frame_selection();
					break;
				case 'Escape':
					tab_menu_options.close_tab_menu();
					tab_menu_options.close_node_create();
					break;
				case 'Tab':
					tab_menu_options.toggle_tab_menu();
					event.preventDefault();
					event.stopPropagation();
					break;
				default:
					//this.add_to_context_menu_filter(event.key)
					key_processed = false;
			}
		}

		return key_processed;
	}

	function on_key_up(event: KeyboardEvent) {
		return false;
	}

	function delete_selected_nodes() {
		const node = StoreController.editor.current_node();
		if (node && node.children_allowed() && node.children_controller) {
			const command = new NodeDeleteCommand(node, node.children_controller.selection.nodes());
			command.push();
		}
	}

	//
	//
	// BUFFER COPY/PASTE
	//
	//
	function cut() {}
	//
	function copy() {
		const node = StoreController.editor.current_node();
		if (node && node.children_allowed() && node.children_controller) {
			clipboard_helper.copy_from_node(node, node.children_controller.selection.nodes());
		}
	}
	function paste() {
		const node = StoreController.editor.current_node();
		if (node) {
			clipboard_helper.paste_in_node(node, cam_animation_helper);
		}
	}

	return {
		on_key_press,
		on_key_down,
		on_key_up,
		delete_selected_nodes,
		cut,
		copy,
		paste,
	};
}
