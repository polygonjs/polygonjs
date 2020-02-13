
<template lang='pug'>

	include /mixins.pug

	doctype html


	.Panel.Params.full_height_container.grid-y
		.cell.shrink(v-if = 'display_toolbar')
			.grid-x
				.cell.auto
					//- DropDownMenu(
					//- 	label = '+ Spare Params'
					//- 	:entries = 'add_spare_param_menu_entries'
					//- 	@select = 'on_add_spare_param_menu_entry_select'
					//- )
					.node_name_container.text-center
						span.node_name(@click = 'on_name_click') {{selected_node_name}}
						span.node_type(v-if = 'selected_node_type') ({{selected_node_type}})
				.cell.shrink
					//- DropDownMenu(
					//- 	v-if = 'has_presets'
					//- 	:label = '"presets"'
					//- 	:entries = 'preset_entries'
					//- 	@select = 'use_preset'
					//- 	:key = 'presets_key'
					//- )

					//- a.node_help_button(
					//- 	v-if = 'display_node_doc_help'
					//- 	:href = 'node_doc_url'
					//- 	target = '_blank'
					//- 	) help
		.cell.auto.params_container
			form
				//- .grid-x
				//- 	.cell.auto.params_folder(
				//- 		v-for = 'folder_name, i in selected_node_folder_names'
				//- 		:class = 'folder_class_objects[i]'
				//- 	)
				//- 		.folder_name(
				//- 			v-if = 'folder_name.length > 0'
				//- 			@click = 'set_active_folder(folder_name)'
				//- 		) {{folder_name}}

					//- v-if = '!display_spare_params_only'
					//- :description = 'param_descriptions[json_param.name]'
					//- :tabindex = "param_tab_indices[i]"
				ParamFieldContainer(
					v-for = 'json_param, i in selected_node_json_params_for_current_folder'
					:json_param = 'json_param'
					:key = 'json_param.graph_node_id'
				)
				//- ParamFieldContainer(
				//- 	v-for = 'json_param, i in selected_node_json_spare_params'
				//- 	:json_param = 'json_param'
				//- 	:key = 'json_param.graph_node_id'
				//- 	:tabindex = "spare_param_tab_indices[i]"
				//- )




</template>

<script lang='ts'>
// import lodash_values from 'lodash/values';

// mixins
import {SetupFolders} from './mixins/Folders';
// import {Json} from './mixins/Json';
// import {ParamDescription} from './mixins/ParamDescription';
// import {Presets} from './mixins/Presets';
// import Menu from './Mixin/Menu'
// import ParamsEmit from './Mixin/ParamsEmit'

import DropDownMenu from 'src/editor/components/widgets/DropDownMenu.vue';

// components
import ParamFieldContainer from './components/Param.vue';
import {NodeSetNameCommand} from '../../../history/commands/NodeSetName';
import {StoreController} from '../../../store/controllers/StoreController';
import {SetupSelectedNode} from '../../mixins/SelectedNode';

import {createComponent, computed, watch} from '@vue/composition-api';
export default createComponent({
	name: 'param-panel',
	// mixins: [Folders, Json, NodeOwner, ParamDescription, Presets, Selection],
	components: {ParamFieldContainer, DropDownMenu},

	props: {
		display_toolbar: {
			type: Boolean,
			default: true,
		},
		// display_spare_params_only: {
		// 	type: Boolean,
		// 	default: false,
		// },
	},
	// watch:
	// 	first_selected_node: ->
	// 		this.emit_node_params()

	setup(props) {
		const selection_options = SetupSelectedNode();

		const first_selected_node_id = computed(() => {
			return selection_options.first_selected_node_id.value;
		});

		watch(first_selected_node_id, (new_id: string | null) => {
			if (new_id) {
				StoreController.engine.add_node_params_to_store(new_id);
			}
		});

		const display_node_doc_help = computed(() => {
			return false; //first_selected_json_node != null && !this.selected_node.constructor.is_custom_node();
		});
		const node_doc_url = computed(() => {
			return '';
			// if (this.display_node_doc_help) {
			// 	const selected_node = this.graph.node_from_id(this.selected_json_node.graph_node_id);
			// 	const context = selected_node.node_context().toLowerCase();
			// 	const type = selected_node.type();
			// 	return `https://doc.polygonjs.com/nodes/${context}/${type}.html`;
			// }
		});

		// functions
		async function on_name_click() {
			const node = selection_options.first_selected_node();
			if (!node) {
				return;
			}
			const new_name: string = await StoreController.editor.dialog_prompt.show({
				title: 'Rename Node:',
				default_value: node.name,
				confirm_label: 'Update Name',
			});

			if (new_name !== null && new_name.length > 0) {
				const cmd = new NodeSetNameCommand(node, new_name);
				cmd.push();
			}
		}

		return {
			display_node_doc_help,
			node_doc_url,
			on_name_click,
			...selection_options,
			...SetupFolders(),
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	$color_node_name_hover: darken($color_font, 20%)
	.Panel.Params
		// background-color: $color_bg_panel_param

		.params_container
			overflow-y: auto

		.node_name_container, .node_help_button
			margin: 10px 5px
		.node_name_container
			.node_name
				cursor: pointer
				&:hover
					color: $color_node_name_hover
			.node_type
				margin-left: 10px
				opacity: 0.75
				font-style: italic
		.node_help_button
			color: $color_font
			display: inline-block
			cursor: pointer
			margin-right: 10px
			padding: 0px 10px
			border-bottom: 2px solid transparent
			&:hover
				color: $primary-color
				border-bottom: 2px solid $primary-color

		.params_container
			padding-right: 10px
			padding-bottom: 10px

			.params_folder
				.folder_name
					padding: 2px 5px
					font-size: 0.8rem
					margin-bottom: 5px
					cursor: pointer
					text-align: center
					// border-bottom: 2px solid transparent
					// background-color: mix($color_bg_panel_param, $primary-color, 70%)
					background-color: lighten($color_bg_panel_param, 5%)
					border-bottom: 2px solid darken($color_bg_panel_param, 30%)
					&:hover
						opacity: 0.8
						background-color: darken($color_bg_panel_param, 30%)
				&.label_hidden
					.folder_name
						display: none
				&.active
					.folder_name
						background-color: darken($color_bg_panel_param, 30%)

</style>
