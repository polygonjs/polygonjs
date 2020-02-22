import lodash_cloneDeep from 'lodash/cloneDeep';
import {CoreDom} from 'src/core/Dom';
import {MultiplePanelProps, PanelInitProperties, MultiplePanelSplitMode} from 'src/editor/components/types/props';
import {ref, Ref, onBeforeMount, computed, SetupContext} from '@vue/composition-api';

enum MultiplePanelSplitLabel {
	HORIZONTAL = 'left/right',
	VERTICAL = 'top/bottom',
}

enum MultiplePanelSplitAction {
	DELETE = 'delete',
}

import {ISetupMultiplePanelPanels} from './Panels';
import {StoreController} from 'src/editor/store/controllers/StoreController';

const left_column_init_properties: PanelInitProperties = {
	split_mode: MultiplePanelSplitMode.VERTICAL,
	sub_panels_init_properties: [
		{
			panel_types: ['viewer'],
			current_panel_index: 0,
		},
		{
			panel_types: ['param'],
			current_panel_index: 0,
		},
	],
};

const network_init_properties: PanelInitProperties = {
	panel_types: ['network'],
	current_panel_index: 0,
};

export function SetupMultiplePanelSplit(
	props: MultiplePanelProps,
	context: SetupContext,
	element: Ref<HTMLElement | null>,
	PanelsMixin: ISetupMultiplePanelPanels,
	init_properties_for_split_panels: () => PanelInitProperties
	// image_element_ref: Ref<HTMLElement>,
	// {emit},
) {
	const split_mode = ref<MultiplePanelSplitMode | null>(props.init_properties.split_mode || null);
	const split_panel_init_properties = ref<[PanelInitProperties, PanelInitProperties]>(
		props.init_properties.sub_panels_init_properties || [left_column_init_properties, network_init_properties]
	);
	const split_ratio = ref(0.5);
	const cells_visible_state = computed(() => {
		const fullscreen_panel_id = StoreController.editor.panel.fullscreen_panel_id();
		if (fullscreen_panel_id) {
			if (fullscreen_panel_id.includes(cell_panel_ids.value[0])) {
				return [true, false];
			} else {
				return [false, true];
			}
		} else {
			return [true, true];
		}
	});
	const overriden_split_ratio = computed(() => {
		const fullscreen_panel_id = StoreController.editor.panel.fullscreen_panel_id();
		if (fullscreen_panel_id) {
			if (fullscreen_panel_id.includes(cell_panel_ids.value[0])) {
				return 1;
			} else {
				return 0;
			}
		} else {
			return split_ratio.value;
		}
	});

	onBeforeMount(() => {});

	const is_split = computed(() => split_mode.value != null);

	const is_split_horizontally = computed(
		() => is_split.value && split_mode.value == MultiplePanelSplitMode.HORIZONTAL
	);
	const is_split_vertically = computed(() => is_split.value && split_mode.value == MultiplePanelSplitMode.VERTICAL);
	const split_types = computed(() => {
		const list = [
			{id: MultiplePanelSplitMode.HORIZONTAL as string, label: `split ${MultiplePanelSplitLabel.HORIZONTAL}`},
			{id: MultiplePanelSplitMode.VERTICAL as string, label: `split ${MultiplePanelSplitLabel.VERTICAL}`},
		];

		if (props.level > 0) {
			list.push({id: MultiplePanelSplitAction.DELETE, label: 'delete'});
		}

		return list;
	});
	const split_container_class_object = computed(() => {
		return {
			'split-panel-horizontal': is_split_horizontally.value,
			'split-panel-vertical': is_split_vertically.value,
			'full_height_container grid-x': is_split_horizontally.value,
			'full_height_container grid-y': is_split_vertically.value,
		};
	});

	const full_screen_activated = computed(() => {
		const fullscreen_panel_id = StoreController.editor.panel.fullscreen_panel_id();
		return fullscreen_panel_id != null;
	});
	const cell_panel_ids = computed(() => {
		return [props.panel_id + ':0', props.panel_id + ':1'];
	});
	const cell_style_objects = computed(() => {
		const style_keys = is_split_horizontally.value ? 'width' : 'height';
		const style0: Dictionary<string> = {};
		const style1: Dictionary<string> = {};
		style0[style_keys] = `${100 * overriden_split_ratio.value}%`;
		style1[style_keys] = `${100 * (1 - overriden_split_ratio.value)}%`;

		if (!cells_visible_state.value[0]) {
			style0['display'] = 'none';
		}
		if (!cells_visible_state.value[1]) {
			style1['display'] = 'none';
		}

		return [style0, style1];
	});

	const split_panel_separator_style_object = computed(() => {
		if (is_split_horizontally.value) {
			return {left: `${100 * split_ratio.value}%`};
		} else {
			return {top: `${100 * split_ratio.value}%`};
		}
	});

	// functions
	function set_split_mode(mode: MultiplePanelSplitMode | MultiplePanelSplitAction) {
		if (mode === MultiplePanelSplitAction.DELETE) {
			context.emit('delete', props.panel_id);
		} else {
			split_mode.value = mode;
			split_panel_init_properties.value = [
				lodash_cloneDeep(init_properties_for_split_panels()),
				lodash_cloneDeep(init_properties_for_split_panels()),
			];
		}
	}

	function delete_split_panel(index: number) {
		PanelsMixin.set_panel_types_from_split_panel(index);
		split_mode.value = null;
	}

	const current_element_bbox = {
		min: {
			x: 0,
			y: 0,
		},
		size: {
			x: 0,
			y: 0,
		},
	};
	function on_move_start(e: MouseEvent) {
		if (!element.value) {
			return;
		}
		const rect = element.value.getBoundingClientRect();
		current_element_bbox.min.x = rect.left;
		current_element_bbox.min.y = rect.top;
		current_element_bbox.size.x = element.value.offsetWidth;
		current_element_bbox.size.y = element.value.offsetHeight;

		CoreDom.add_drag_classes();
		document.addEventListener('mousemove', on_move_drag);
		document.addEventListener('mouseup', on_move_end);
	}

	function on_move_drag(e: MouseEvent) {
		const current_mouse_pos = {
			x: e.pageX,
			y: e.pageY,
		};

		const ratio = {
			x: (current_mouse_pos.x - current_element_bbox.min.x) / current_element_bbox.size.x,
			y: (current_mouse_pos.y - current_element_bbox.min.y) / current_element_bbox.size.y,
		};

		split_ratio.value = is_split_horizontally.value ? ratio.x : ratio.y;
	}

	function on_move_end(e: MouseEvent) {
		document.removeEventListener('mousemove', on_move_drag);
		document.removeEventListener('mouseup', on_move_end);
		CoreDom.remove_drag_classes();

		window.dispatchEvent(new Event('resize'));
	}

	return {
		is_split,
		on_move_start,
		delete_split_panel,
		set_split_mode,
		split_mode,
		full_screen_activated,
		split_panel_separator_style_object,
		cell_panel_ids,
		cell_style_objects,
		split_container_class_object,
		split_types,
		split_panel_init_properties,
	};
}
