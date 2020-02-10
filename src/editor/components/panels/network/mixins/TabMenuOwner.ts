// import lodash_last from 'lodash/last';

// components
import {EventHelper} from 'src/core/EventHelper';
import {Vector2} from 'three/src/math/Vector2';

import {NodeCreationHelper} from '../helpers/NodeCreation';
// import { DropDownMenuEntry } from 'src/editor/components/types/props';

interface TabMenuStyleObject {
	left: string;
	top: string;
}

export interface TabMenuOptions {
	tab_menu_opened: Ref<boolean>;
	tab_menu_style_object: Ref<TabMenuStyleObject>;
	open_tab_menu: () => void;
	close_tab_menu: () => void;
	close_node_create: () => void;
	toggle_tab_menu: () => void;
	on_tab_menu_select: (str: string) => void;
	update_tab_menu_position: (event: MouseEvent) => void;
}

import {ref, Ref, computed} from '@vue/composition-api';
export function SetupTabMenu(
	canvas: Ref<HTMLCanvasElement | null>,
	node_creation_helper: NodeCreationHelper
): TabMenuOptions {
	const tab_menu_opened = ref(false);
	const tab_menu_mouse_position = ref({x: 0, y: 0});

	const tab_menu_style_object = computed(() => {
		const left = tab_menu_mouse_position.value.x - 10;
		return {
			left: `${left}px`,
			top: `${tab_menu_mouse_position.value.y}px`,
		};
	});

	// functions
	function update_tab_menu_position(event: MouseEvent) {
		if (!tab_menu_opened.value && canvas.value) {
			const event_helper = new EventHelper(canvas.value);
			event_helper.element_position(event, tab_menu_mouse_position.value as Vector2);
		}
	}

	function open_tab_menu() {
		_set_tab_menu_state(true);
	}

	function toggle_tab_menu() {
		_set_tab_menu_state(!tab_menu_opened.value);
	}

	function close_tab_menu() {
		_set_tab_menu_state(false);
	}

	function _set_tab_menu_state(state: boolean) {
		tab_menu_opened.value = state;
	}

	function on_tab_menu_select(entry: string) {
		const elements = entry.split('/');
		const last_element = elements[elements.length - 1];
		console.log('on_tab_menu_select', entry, last_element);
		node_creation_helper.activate(last_element);
	}

	function close_node_create() {
		node_creation_helper.deactivate();
	}

	return {
		tab_menu_opened,
		tab_menu_style_object,
		open_tab_menu,
		toggle_tab_menu,
		close_tab_menu,
		on_tab_menu_select,
		close_node_create,
		update_tab_menu_position,
	};
}
