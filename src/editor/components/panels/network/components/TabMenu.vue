
<template lang='pug'>

	include /mixins.pug

	doctype html

	.TabMenu
		DropDownMenu(
			:display_label = 'false'
			:always_visible = 'true'
			:entries = 'menu_entries'
			:sort_entries = 'true'
			:emphasis = 'filter'
			@select = 'on_select'
		)



</template>

<script lang='ts'>
import lodash_includes from 'lodash/includes';
import lodash_values from 'lodash/values';
import lodash_flatten from 'lodash/flatten';

// TODO: if I open the tab menu, but move the cursor away from it
// it will not receive key events

// internal libs

// mixins
// import NodeOwner from 'src/Editor/Component/Mixin/NodeOwner';

// components
import {DropDownMenuEntry} from 'src/editor/components/types/props';
import {StoreController} from 'src/editor/store/controllers/StoreController';
import {POLY} from 'src/engine/Poly';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {KeyEventsDispatcher} from 'src/editor/helpers/KeyEventsDispatcher';

import {createComponent, ref, onMounted, onBeforeUnmount, computed, SetupContext} from '@vue/composition-api';
export default createComponent({
	name: 'tab-menu',
	// mixins: [NodeOwner],

	setup(props, context: SetupContext) {
		const filter = ref('');

		onMounted(() => {
			register_key_processor();
		});
		onBeforeUnmount(() => {
			deregister_key_processor();
		});

		const current_node_graph_id = computed(() => StoreController.editor.current_node_graph_id());

		// computed
		const menu_entries = computed(() => {
			if (!current_node_graph_id.value) {
				return [];
			}

			let entries = compute_menu_entries();

			if (entries.length === 0) {
				trim_filter();
				entries = compute_menu_entries();
			}

			return entries;
		});

		const filter_empty = computed(() => {
			return filter.value == null || filter.value === '';
		});

		// functions
		function register_key_processor() {
			// window.key_events_dispatcher.register_processor(this)
			KeyEventsDispatcher.instance().deactivate();
			document.addEventListener('keypress', _on_keypress);
			document.addEventListener('keydown', _on_keydown);
			document.addEventListener('keyup', _on_keyup);
		}
		function deregister_key_processor() {
			// window.key_events_dispatcher.deregister_processor(this)
			document.removeEventListener('keypress', _on_keypress);
			document.removeEventListener('keydown', _on_keydown);
			document.removeEventListener('keyup', _on_keyup);
			KeyEventsDispatcher.instance().activate();
		}

		function _on_keypress(event: KeyboardEvent) {
			add_to_filter(event.key);
			return true;
		}

		function _on_keydown(event: KeyboardEvent) {
			let key_processed = true;
			switch (event.key) {
				case 'Tab':
					close();
					break;
				default:
					key_processed = false;
			}
			return key_processed;
		}

		function _on_keyup(event: KeyboardEvent) {
			let key_processed = true;
			switch (event.key) {
				case 'Backspace':
					trim_filter();
					break;
				case 'Escape':
					close();
					break;
				default:
					key_processed = false;
			}
			return key_processed;
		}

		function add_to_filter(letter: string) {
			filter.value += letter;
		}
		function trim_filter() {
			filter.value = filter.value.slice(0, filter.value.length - 1);
		}
		function close() {
			context.emit('close');
		}

		function on_select(entry_id: string) {
			context.emit('select', entry_id);
			close();
		}

		function tab_menu_entries(context: NodeContext, parent_node_type: string) {
			const nodes_by_category: Dictionary<string[]> = {};
			POLY.nodes_register
				.registered_nodes_for_context_and_parent_type(context, parent_node_type)
				.forEach((node) => {
					const category = POLY.nodes_register.registered_category(context, node.type());
					nodes_by_category[category] = nodes_by_category[category] || [];
					nodes_by_category[category].push(node.type());
				});
			return nodes_by_category;
		}
		function compute_menu_entries(): DropDownMenuEntry[] {
			// const available_children_classes = this.node.available_children_classes();
			const node = StoreController.editor.current_node();
			if (!node.children_allowed() || !node.children_controller) {
				return [];
			}

			const registered_entries = tab_menu_entries(node.children_controller.context, node.type);

			if (filter_empty.value) {
				const all_entries: DropDownMenuEntry[] = [];
				Object.keys(registered_entries).forEach(function(category) {
					const children = registered_entries[category]
						.sort()
						.map((sub_entry) => ({id: sub_entry, label: sub_entry}));
					all_entries.push({id: category, label: category, children});
				});
				return all_entries;
			} else {
				const filter_lowercase = filter.value.toLowerCase();
				const all_types = lodash_flatten(lodash_values(registered_entries));
				const filtered_types = all_types.filter((type) => {
					return lodash_includes(type, filter_lowercase);
				});
				return filtered_types.map((entry) => ({id: entry, label: entry}));
			}
		}

		return {
			menu_entries,
			filter,
			on_select,
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	.TabMenu
		position: absolute



</style>
