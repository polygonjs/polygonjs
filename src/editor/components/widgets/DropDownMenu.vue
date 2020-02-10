<template lang="pug">

	include /mixins.pug

	doctype html

	//- @mouseenter = 'compute_max_height'
	.dropdown_menu(
		:class = 'dropdown_menu_class_object'
		@click = 'toggle_display'
		)
		div(
			:class = 'dropdown_menu_label_object'
			:style = 'menu_label_style_object'
			)
			.dropdown_menu_label_content(
				v-if = 'display_label'
				) {{label}}
			.dropdown_menu_pixel(
				:class = 'pixel_class_object'
				)
				.dropdown_menu_content(
					ref = 'dropdown_menu_content'
					:class = 'content_class_object'
					:style = 'content_style_object'
					@mouseleave = 'unset_hovered_entry'
					)
					ul
						li(
							v-for = 'entry, i in sorted_entries'
							:key = 'i'
							@mouseenter = 'set_hovered_entry_index(i)'
							ref = 'entry_element'
						)
							.entry(
								@click.stop = 'select(entry)'
								:class = 'entry_class_objects[i]'
							)
								span(v-if = 'has_emphasis')
									span {{entry_labels_pre_emphasis[i]}}
									span.emphasis {{emphasis}}
									span {{entry_labels_post_emphasis[i]}}
								span(v-else)
									span {{entry_labels[i]}}

				DropDownMenu.sub_entries_dropdown(
					v-if = 'hovered_entry_has_children'
					:style = 'sub_dropdown_style_object'
					:init_position_top = 'sub_dropdown_init_position_top'
					:level = 'level+1'
					:display_label = 'false'
					:entries = 'hovered_entry_children'
					:event_id_prefix = 'hovered_entry_id'
					:always_visible = 'true'
					:emphasis = 'emphasis'
					:key = 'hovered_entry_id'
					@select = 'on_entry_select'
				)
				//- DropDownMenu(
				//- 	v-if = 'entry_has_children[i]'
				//- 	:level = 'level+1'
				//- 	:label = 'entry_labels[i]'
				//- 	:entries = 'entry_children[i]'
				//- 	:event_id_prefix = 'entry_ids[i]'
				//- 	:emphasis = 'emphasis'
				//- 	@select = 'on_entry_select'
				//- )


</template>

<script lang="ts">
import lodash_sortBy from 'lodash/sortBy';

import {CoreString} from 'src/core/String';

import {DropDownMenuEntry} from 'src/editor/components/types/props';

interface DropDownMenuProps {
	level: number;
	on_hover: boolean;
	label: string;
	display_label: boolean;
	label_padding: Number2;
	always_visible: boolean;
	entries: DropDownMenuEntry[];
	sort_entries: boolean;
	right_aligned: boolean;
	event_id_prefix: string | undefined;
	emphasis: string;
	init_position_top: number;
}

import {createComponent, ref, onMounted, computed, onBeforeMount, SetupContext} from '@vue/composition-api';
export default createComponent({
	name: 'dropdown-menu',
	props: {
		level: {
			type: Number,
			default: 0,
		},
		on_hover: {
			type: Boolean,
			default: true,
		},
		label: {
			type: String,
			default: 'Menu',
		},
		display_label: {
			type: Boolean,
			default: true,
		},
		label_padding: {
			type: Array,
			default() {
				return [5, 10];
			},
		},
		always_visible: {
			type: Boolean,
			default: false,
		},
		entries: {
			type: Array,
			default() {
				return [
					'entry 1',
					// {'entry 2': ['a', 'b']}
					'entry 3',
				];
			},
		},
		sort_entries: {
			type: Boolean,
			default: false,
		},
		right_aligned: {
			type: Boolean,
			default: false,
		},
		event_id_prefix: {
			type: String,
			default: '',
		},
		emphasis: {
			type: String,
			default: '',
		},
		init_position_top: {
			type: Number,
			default: 0,
		},
	},

	setup(props: DropDownMenuProps, context: SetupContext) {
		const displayed = ref(false);
		const position_top_offset = ref(0);
		const content_max_height = ref<number>(1000);
		const scroll_bars_required = ref(false);
		const hovered_entry_index = ref(-1);
		// const hovered_timestamp = ref(-1);

		const dropdown_menu_content = ref<HTMLElement>(null);
		const entry_element = ref<HTMLElement[]>(null);

		onBeforeMount(() => {
			// TODO: typescript check this
			// this.$options.components.DropDownMenu = require('./DropDownMenu').default;
		});
		onMounted(() => {
			compute_max_height();
		});

		const content_top_position = computed(() => {
			return props.init_position_top + position_top_offset.value;
		});
		// TODO: typescript check this
		// watch(()=>{
		// 	displayed(new_displayed) {
		// 		if (new_displayed) {
		// 			this.compute_max_height();
		// 		}
		// 	},
		// 	sorted_entries: {
		// 		handler(new_sorted_entries) {
		// 			this.compute_max_height();
		// 		},
		// 		deep: true,
		// 	},
		// })

		const hovered_entry_has_children = computed(() => entry_has_children.value[hovered_entry_index.value]);
		const sub_dropdown_style_object = computed(() => {
			const entry_parent = dropdown_menu_content.value;
			if (entry_parent && entry_element.value) {
				// const current_entry_element = entry_element.value[hovered_entry_index.value];
				// const entry_parent_top = entry_parent.getBoundingClientRect().top;
				// const entry_element_top = current_entry_element.getBoundingClientRect().top;
				const width = entry_parent.offsetWidth;
				return {
					// top: `${entry_element_top - entry_parent_top}px`,
					left: `${width}px`,
				};
			} else {
				return {};
			}
		});
		const sub_dropdown_init_position_top = computed(() => {
			const entry_parent = dropdown_menu_content.value;
			if (entry_parent && entry_element.value) {
				const current_entry_element = entry_element.value[hovered_entry_index.value];
				const entry_parent_top = entry_parent.getBoundingClientRect().top;
				const entry_element_top = current_entry_element.getBoundingClientRect().top;
				return entry_element_top - entry_parent_top + position_top_offset.value;
			} else {
				return 0;
			}
		});
		const hovered_entry_children = computed(() => {
			return entry_children.value[hovered_entry_index.value];
		});
		const hovered_entry_id = computed(() => {
			return entry_ids.value[hovered_entry_index.value];
		});

		const has_emphasis = computed(() => {
			return props.emphasis != null && props.emphasis.length >= 0;
		});
		const sorted_entries = computed(() => {
			if (props.sort_entries) {
				const entries_by_name: Dictionary<DropDownMenuEntry> = {};
				props.entries.forEach((entry) => {
					entries_by_name[entry['id']] = entry;
				});

				const names = lodash_sortBy(Object.keys(entries_by_name));
				return names.map((name) => entries_by_name[name]);
			} else {
				return props.entries;
			}
		});

		const entry_ids = computed(() => {
			return sorted_entries.value.map((entry) => entry['id']);
		});

		const entry_labels = computed(() => {
			return sorted_entries.value.map((entry) => {
				const label = entry['label'];
				return label || CoreString.titleize(entry['id']);
			});
		});
		const emphasis_indices = computed(() => {
			return entry_labels.value.map((entry_label) => {
				return entry_label.indexOf(props.emphasis);
			});
		});

		const entry_labels_pre_emphasis = computed(() => {
			return entry_labels.value.map((entry_label, i) => {
				const index = emphasis_indices.value[i];
				if (index === 0) {
					return '';
				} else if (index > 0) {
					return entry_label.slice(0, +(index - 1) + 1 || undefined);
				} else {
					return entry_label;
				}
			});
		});
		const entry_labels_post_emphasis = computed(() => {
			return entry_labels.value.map((entry_label, i) => {
				const index = emphasis_indices.value[i];
				if (index >= entry_label.length - props.emphasis.length) {
					return '';
				} else {
					return entry_label.slice(index + props.emphasis.length);
				}
			});
		});

		const entry_disabled_states = computed(() => {
			return sorted_entries.value.map((entry) => entry['disabled'] === true);
		});
		const entry_class_objects = computed(() => {
			return sorted_entries.value.map((entry, i) => {
				return {
					disabled: entry_disabled_states.value[i],
					active: !entry_disabled_states.value[i],
				};
			});
		});

		const entry_has_children = computed(() => {
			return sorted_entries.value.map((entry) => {
				return entry['children'] != null;
			});
		});

		const entry_children = computed(() => {
			return sorted_entries.value.map(
				(entry) =>
					// lodash_values(entry)[0]
					entry['children']
			);
		});

		// entry_class_objects: ->
		// 	lodash_map this.entries, (entry, i)=>
		// 		has_sub_entry: this.entry_has_sub_entries[i]

		const dropdown_menu_class_object = computed(() => {
			return {
				on_hover: props.on_hover,
				displayed: displayed.value,
			};
		});
		const menu_label_style_object = computed(() => {
			if (props.display_label) {
				return {
					padding: props.label_padding.map((pad) => `${pad}px`).join(' '),
				};
			}
		});

		const pixel_class_object = computed(() => {
			const is_root = props.level === 0;

			return {
				bottom_left: is_root,
				top_right: !is_root,
				always_visible: props.always_visible || displayed.value,
				right_aligned: props.right_aligned,
			};
		});

		const content_class_object = computed(() => {
			return {right_aligned: props.right_aligned};
		});
		const content_style_object = computed(() => {
			if (scroll_bars_required.value) {
				return {
					top: `${Math.floor(content_top_position.value)}px`,
					maxHeight: `${Math.floor(content_max_height.value)}px`,
					overflowY: 'scroll',
				};
			} else {
				return {
					top: `${Math.floor(content_top_position.value)}px`,
					maxHeight: null,
					overflowY: null,
				};
			}
		});

		const dropdown_menu_label_object = computed(() => {
			if (props.display_label) {
				return {
					dropdown_menu_label: true,
				};
			}
		});

		// functions
		function compute_max_height() {
			// content_max_height.value = document.body.offsetHeight;
			scroll_bars_required.value = false;

			// TODO: typescript check this
			// this.$nextTick(() => {
			if (!dropdown_menu_content.value) {
				return;
			}
			const rect = dropdown_menu_content.value.getBoundingClientRect();
			const top = rect.top;
			const element_height = rect.height;
			const window_height = window.innerHeight;
			// const available_height = window_height - top;
			// const max_top = window_height - available_height;

			// if the element is taller than the window
			if (element_height > window_height) {
				// 10px margin to be sure its content stops befor the bottom of the window
				// content_top_position.value = Math.min(element_height - available_height, max_top);
				content_max_height.value = window_height; //(window_height - top) - 10
				position_top_offset.value = -top;
				scroll_bars_required.value = true;
			} else {
				const visible_height = window_height - top;
				const hidden_height = element_height - visible_height;

				// if the element has part of it under the bottom of the window
				if (hidden_height > 0) {
					position_top_offset.value = -hidden_height;
					// if the element is fully visible, no offset needed
				} else {
					position_top_offset.value = 0;
				}
				content_max_height.value = element_height;
				scroll_bars_required.value = false;
			}
			// });
		}

		function set_hovered_entry_index(index: number) {
			hovered_entry_index.value = index;
			// hovered_timestamp.value = performance.now();
		}
		function unset_hovered_entry() {
			// this.hovered_entry_index = -1
		}

		function select(entry: DropDownMenuEntry) {
			const is_disabled = entry['disabled'] || false;
			if (!is_disabled) {
				displayed.value = false;
				const id = entry['id'];
				let emitted = id;
				if (props.event_id_prefix) {
					emitted = `${props.event_id_prefix}/${id}`;
				}
				context.emit('select', emitted); // emits the string of id, optionally prefixed by props.event_id_prefix
			}
		}

		function on_entry_select(entry: DropDownMenuEntry) {
			displayed.value = false;
			context.emit('select', entry); // emits the entry object
		}

		function toggle_display() {
			displayed.value = !displayed.value;
		}

		return {
			displayed,
			content_top_position,
			content_max_height,
			// scroll_bars_required,
			hovered_entry_index,
			dropdown_menu_content,
			entry_element,
			hovered_entry_has_children,
			sub_dropdown_style_object,
			sub_dropdown_init_position_top,
			hovered_entry_children,
			hovered_entry_id,
			// hovered_timestamp,
			has_emphasis,
			sorted_entries,
			entry_ids,
			entry_labels,
			emphasis_indices,
			entry_labels_pre_emphasis,
			entry_labels_post_emphasis,
			entry_disabled_states,
			entry_class_objects,
			entry_has_children,
			entry_children,
			dropdown_menu_class_object,
			menu_label_style_object,
			pixel_class_object,
			content_class_object,
			content_style_object,
			dropdown_menu_label_object,
			position_top_offset,

			// functions
			set_hovered_entry_index,
			unset_hovered_entry,
			select,
			on_entry_select,
			toggle_display,
			compute_max_height,
		};
	},
});
</script>

<style lang="sass">
@import "globals.sass"

// $menu_content_bg_color: #eee

.dropdown_menu, .dropdown_menu_label, .dropdown_menu_label_content
	display: inline-block

.dropdown_menu
	&:hover
		.dropdown_menu_label
			// background-color: $menu_content_bg_color
	&.on_hover
		&:hover > .dropdown_menu_label > .dropdown_menu_pixel
			&:not(.always_visible)
				display: block

	li
		display: block
	.dropdown_menu_label
		position: relative
		cursor: pointer

		// &.default_label_padding
		// 	padding: 5px 10px


		.dropdown_menu_label_content

			&:hover
				opacity: 0.8
		// display: inline-block
		.dropdown_menu_pixel
			&:not(.always_visible)
				display: none
			&.always_visible
				display: block



	.dropdown_menu_pixel
		z-index: $z_index_dropdown_menu
		position: absolute
		// width: 1px
		height: 1px
		// background-color: red
		&.bottom_left:not(.right_aligned)
			bottom: 0px
			left: 0px
		&.top_right
			top: 0px
			// right: 0px
			left: 100%
		&.right_aligned
			bottom: 0px
			// right: 0px
			left: 100%
		.dropdown_menu_content
			position: absolute
			border: 1px solid $color_bg
			background-color: $color_bg_dropdown_menu
			// border-radius: 5px
			overflow-x: hidden
			// box-shadow: 10px 10px 30px 15px gray
			// width: 200px
			&.right_aligned
				position: relative
				right: 100%
			.dropdown_menu, .dropdown_menu_label
				display: block
			ul
				list-style-type: none
				margin: 0px
				li
					.entry
						padding: 5px 10px
						white-space: nowrap
						.dropdown_menu_label
							top: -5px
						&.disabled
							cursor: default
							color: mix($color_bg_dropdown_menu, $color_font, 70%)
						&.active
							cursor: pointer
							&:hover
								background-color: darken($color_bg_dropdown_menu, 5%)

						.emphasis
							color: $alert-color
							font-weight: bold
							border-bottom: 2px solid $alert-color

		.sub_entries_dropdown
			position: absolute
</style>
