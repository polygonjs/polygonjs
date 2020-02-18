<template lang="pug">

	include /mixins.pug

	doctype html

	.Panel.Multiple.cell.auto(
		ref='element'
		)

		div(
			v-if = 'is_split'
			:class = 'split_container_class_object'
			)
			.cell(
				:style = 'cell_style_objects[0]'
				)
				.full_height_container.grid-y
					MultiplePanel(
						:level = 'level+1'
						:init_properties = "split_panel_init_properties[0]"
						:scene_update_allowed = 'scene_update_allowed'
						:panel_id = 'cell_panel_ids[0]'
						ref = 'split_panel0'
						@delete = 'delete_split_panel(0)'
					)
			//- .cell.shrink.split_panel_separator(
			//- 	@mousedown = 'on_move_start'
			//- 	)
			.cell(
				:style = 'cell_style_objects[1]'
				)
				.full_height_container.grid-y
					MultiplePanel(
						:level = 'level+1'
						:init_properties = "split_panel_init_properties[1]"
						:scene_update_allowed = 'scene_update_allowed'
						:panel_id = 'cell_panel_ids[1]'
						ref = 'split_panel1'
						@delete = 'delete_split_panel(1)'
					)
			.split_panel_separator(
				v-if = '!full_screen_activated'
				:style = 'split_panel_separator_style_object'
				@mousedown = 'on_move_start'
				)
				.split_panel_separator_line


		.full_height_container.grid-y(
			v-else
			)
			.cell.shrink.panel_tabs
				.grid-x
					.cell.auto
						ul.no-bullet.tab_list
							li.tab_item_container(
								v-for = 'panel_type, i in panel_types'
								:class = 'tab_class_objects[i]'
							)
								span.tab_item
									span.panel_type_name(
										@click = 'set_current_panel_index(i)'
									) {{panel_type}}
									span.panel_type_close(
										v-if = 'tab_delete_allowed'
										@click = 'remove_tab(i)'
										) ✕
							li.tab_item_container.new_panel
								DropDownMenu(
									:label = '"+"'
									:entries = 'available_panel_types'
									:on_hover = 'false'
									@select = 'add_tab'
									:label_padding = 'tab_menu_label_padding'
								)
					.cell.shrink.split_menu_container_container
						.split_menu_container
							DropDownMenu(
								:label = '"-"'
								:entries = 'split_types'
								:on_hover = 'false'
								@select = 'set_split_mode'
								:label_padding = 'tab_menu_label_padding'
								:right_aligned = 'true'
							)


			.cell.auto.panels_container
				Component(
					:is = "current_panel_type"
					:panel_id = 'panel_id'
					:scene_update_allowed = 'scene_update_allowed'
					ref = 'current_panel'
					@created = 'on_component_created'
				)


</template>

<script lang="ts">
// mixins
import {SetupMultiplePanelJson} from './mixins/Json';
import {SetupMultiplePanelPanels} from './mixins/Panels';
import {SetupMultiplePanelSplit} from './mixins/Split';

import {MultiplePanelProps, MultiplePanelSplitMode} from 'src/editor/components/types/props';

// components
// import Asset from '../../Asset/Asset';
import Network from '../network/Network.vue';
import Params from '../params/Params.vue';
// import ParamEdit from '../../ParamEdit/ParamEdit';
import Viewer from '../viewer/Viewer.vue';
import {PanelInitProperties} from '../../types/props';
// import CustomNodeEditor from '../../CustomNodeEditor/CustomNodeEditor';

// const AsyncPerformance = () => ({
// 	// The component to load (should be a Promise)
// 	component: import('../../Performance/Performance'),
// 	// A component to use while the async component is loading
// 	// loading: LoadingComponent,
// 	// A component to use if the load fails
// 	// error: ErrorComponent,
// 	// Delay before showing the loading component. Default: 200ms.
// 	// delay: 200,
// 	// The error component will be displayed if a timeout is
// 	// provided and exceeded. Default: Infinity.
// 	// timeout: 3000
// });

// const AsyncSpreadsheet = () => ({
// 	// The component to load (should be a Promise)
// 	component: import('../../Spreadsheet/Spreadsheet'),
// 	// A component to use while the async component is loading
// 	// loading: LoadingComponent,
// 	// A component to use if the load fails
// 	// error: ErrorComponent,
// 	// Delay before showing the loading component. Default: 200ms.
// 	// delay: 200,
// 	// The error component will be displayed if a timeout is
// 	// provided and exceeded. Default: Infinity.
// 	// timeout: 3000
// });

import {PanelType} from './mixins/Panels';
const DEFAULT_PANELS = [PanelType.VIEWER, PanelType.PARAMS, PanelType.NETWORK];

const DEFAULT_LAYOUT: PanelInitProperties = {
	split_mode: MultiplePanelSplitMode.HORIZONTAL,
	sub_panels_init_properties: [
		{
			split_mode: MultiplePanelSplitMode.VERTICAL,
			sub_panels_init_properties: [
				{
					panel_types: DEFAULT_PANELS,
					current_panel_index: DEFAULT_PANELS.indexOf(PanelType.VIEWER),
				},
				{
					panel_types: DEFAULT_PANELS,
					current_panel_index: DEFAULT_PANELS.indexOf(PanelType.PARAMS),
				},
			],
		},
		{
			panel_types: DEFAULT_PANELS,
			current_panel_index: DEFAULT_PANELS.indexOf(PanelType.NETWORK),
		},
	],
};

import {createComponent, SetupContext, ref} from '@vue/composition-api';
export default createComponent({
	name: 'MultiplePanel',
	components: {
		// Asset,
		Network,
		Params,
		// ParamEdit,
		Viewer,
		// CustomNodeEditor,
		// Performance: AsyncPerformance,
		// Spreadsheet: AsyncSpreadsheet,
	},
	props: {
		init_properties: {
			type: Object,
			default() {
				return DEFAULT_LAYOUT;
			},
		},
		panel_id: {
			type: String,
			default: 'multi-root',
		},
		level: {
			type: Number,
			default: 0,
		},
		scene_update_allowed: {
			type: Boolean,
			default: false,
		},
	},
	setup(props: MultiplePanelProps, context: SetupContext) {
		const tab_menu_label_padding = ref([0, 5]);

		const element = ref<HTMLElement>(null);
		const split_panel1 = ref<HTMLElement>(null);
		const split_panel2 = ref<HTMLElement>(null);
		const current_panel = ref<HTMLElement>(null);

		const PanelsMixin = SetupMultiplePanelPanels(props, split_panel1, split_panel2);

		function init_properties_for_split_panels() {
			return {
				panel_types: PanelsMixin.panel_types.value,
				current_panel_index: PanelsMixin.current_panel_index.value,
				// TODO: typescript check this
				// panel: current_panel.to_json(), //
			};
		}

		return {
			element,
			split_panel1,
			split_panel2,
			current_panel,
			tab_menu_label_padding,
			...PanelsMixin,
			...SetupMultiplePanelJson(props, PanelsMixin),
			...SetupMultiplePanelSplit(props, context, element, PanelsMixin, init_properties_for_split_panels),
		};
	},
});

// # methods:
// # 	viewers: ->
// # 		if @is_split
// # 			lodash_flatten [
// # 				this.$refs.split_panel0.viewers()
// # 				this.$refs.split_panel1.viewers()
// # 			]
// # 		else
// # 			if @current_panel_type == 'Viewer'
// # 				return [this.$refs.current_panel]
// # 			else
// # 				[]

// # 	panel_with_id: (panel_id)->
// # 		if panel_id.length == 0 && !@is_split
// # 			this.$refs.current_panel
// # 		else
// # 			if @is_split
// # 				panel = switch panel_id[0]
// # 					when 0 then this.$refs.split_panel0
// # 					when 1 then this.$refs.split_panel1

// # 				panel_id.shift()
// # 				panel.panel_with_id( panel_id )
</script>

<style lang="sass">
@import "globals.sass"

// $tab_background_default: $color_bg
// $color_border: lighten($color_bg, 50%)
$color_split_panel_separator: mix($color_bg, $primary-color, 50%)
$color_bg_split_panel_separator_line: $primary-color
$color_split_panel_separator_hover: darken($color_split_panel_separator, 0%)
$color_bg_tab_item_container: $color_bg_panel
// $color_bg_tab_item_container_active: $success-color //mix($color_bg, $success-color, 20%)
$color_font_tab_item_container_inactive: lighten(black, 20%) //$color_bg //lighten($color_font, 50%)
$color_font_tab_item_container_active: black //$color_bg //lighten($color_font, 50%)
$color_border_tab_item_container: darken($color_bg, 20%)
$color_split_menu_container: darken($color_bg, 50%)

$split_panel_size: 4px
// $color_bg_panel_tabs: $color_bg_panel

// $panel_background: lighten($tab_background_default, 10%)
.Panel
	background-color: $color_bg_panel
	// li.tab_item_container
	// 	background-color: $color_bg_tab_item_container
	&.Network
		background-color: $color_bg_panel_network
	&.Params
		background-color: $color_bg_panel_param
	&.ParamEdit
		background-color: $color_bg_panel_param_edit
	&.Viewer
		background-color: $color_bg_panel_viewer
	&.Performance
		background-color: $color_bg_panel_performance
	&.Asset
		background-color: $color_bg_panel_asset
	&.Spreadsheet
		background-color: $color_bg_panel_spreadsheet
	&.CustomNodeEditor
		background-color: $color_bg_panel_custom_node_editor


.Panel.Multiple
	// background-color: $panel_background


	.split_panel_separator
		min-width: $split_panel_size
		min-height: $split_panel_size
		background-color: transparent //$color_split_panel_separator
		&:hover
			background-color: $color_split_panel_separator_hover

	.split-panel-horizontal, .split-panel-vertical
		position: relative
	.split-panel-horizontal > .split_panel_separator
			position: absolute
			top: 0px
			height: 100%
			cursor: ew-resize
			.split_panel_separator_line
				width: 1px
				height: 100%
				background-color: $color_bg_split_panel_separator_line
	.split-panel-vertical > .split_panel_separator
			position: absolute
			left: 0px
			width: 100%
			cursor: ns-resize
			transform: translateY(-100%)
			.split_panel_separator_line
				position: relative
				top: $split_panel_size
				height: 1px
				background-color: $color_bg_split_panel_separator_line

	.panel_tabs
		// background-color: $color_bg_panel
		padding-left: 5px
		// padding-top: 6px
		ul.tab_list
			position: relative
			top: 3px // no idea why but seems necessary to have tabs touch correctly the panel
			margin: 0px
			// margin-top: 2px
			li.tab_item_container
				display: inline-block
				margin-left: 4px
				font-size: 0.75rem
				// opacity: 0.6
				cursor: pointer
				background-color: $color_bg_tab_item_container
				border: 1px solid $color_border_tab_item_container
				border-bottom: 0px
				border-top-left-radius: 3px
				border-top-right-radius: 3px
				color: $color_font_tab_item_container_inactive

				&:hover
					// opacity: 1
					// font-weight: bold
				&.network
					background-color: $color_bg_panel_network
				&.params
					background-color: $color_bg_panel_param
				&.param_edit
					background-color: $color_bg_panel_param_edit
				&.viewer
					background-color: $color_bg_panel_viewer
				&.performance
					background-color: $color_bg_panel_performance
				&.asset
					background-color: $color_bg_panel_asset
				&.spreadsheet
					background-color: $color_bg_panel_spreadsheet
				&.custom_node_editor
					background-color: $color_bg_panel_custom_node_editor
				&.new_panel
					background-color: lighten($color_bg_panel, 10%)
				&.active
					//background-color: $color_bg_tab_item_container_active
					color: $color_font_tab_item_container_active
					padding-bottom: 4px
					top: -3px
					position: relative
					// font-weight: bold

				.tab_item
					padding: 0px 5px
					.panel_type_close
						margin-left: 5px
						position: relative
						top: 1px
						&:hover
							opacity: 0.6

		.split_menu_container_container
			position: relative
			.split_menu_container
				background-color: lighten($color_bg_panel, 10%)
				position: absolute
				top: 5px
				right: 4px
				border-radius: 20px
				border: 1px solid $color_split_menu_container
				line-height: 1
				.dropdown_menu_label
					top: -1px
</style>
