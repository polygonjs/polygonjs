<template lang="pug">

	include /mixins.pug

	doctype html

	//- @mousemove = 'on_mouse_move'
	//- @mouseup = 'on_mouse_up'

	.NetworkNode(
		:style = 'style_object'
		:class = 'class_object'

		)
		.node-body(
			:style = 'node_body_style_object'
			@mousedown = 'on_body_mousedown'
			@mouseup = 'on_body_mouseup'
			@dblclick = 'on_body_dblclick'
			@contextmenu = 'on_contextmenu'
			)
			.icon-container(v-if = 'display_icon')
				v-icon(:name = "icon" scale='1')

		.error-flag-container(
			v-if = 'is_errored'
			:style = 'error_flag_container_style_object'
			)
			.error-flag
				v-icon(name = 'exclamation-triangle' scale="4" )

		.flag-container(
			v-if = 'has_bypass_flag'
			:style = 'bypass_flag_container_style_object'
			)
			.node-flag.bypass-flag(
				:class = 'bypass_flag_class_object'
				:style = 'bypass_flag_style_object'
				@click.stop.prevent = 'on_bypass_flag_click'
			)

		.flag-container(
			v-if = 'has_display_flag'
			:style = 'display_flag_container_style_object'
			)
			.node-flag.display-flag(
				:class = 'display_flag_class_object'
				:style = 'display_flag_style_object'
				@click.stop.prevent = 'on_display_flag_click'
			)

		.name-container.disable-select(
			:style = 'name_container_style_object'
			)
			// @mouseup.stop.prevent = 'on_name_mouseup'
			.name-element(
				@click.stop.prevent = 'on_name_click'
			) {{name}}

		.comment-container(
			:style = 'comment_container_style_object'
			)
			.comment-element(
				v-if = 'display_comment'
			) {{comment}}

		.enter-button-container(
			v-if = 'children_allowed'
			:style = 'enter_button_container_style_object'
			)
			.enter-button(@click = 'open_node')
				v-icon(name='angle-double-down')

		.inputs-container(
			:style = 'inputs_container_style_object'
			)
			//- :style = 'input_style_objects[i]'
			.connection-pixel.input-pixel(
				v-for = 'input, i in available_inputs'
				:style = 'inputs_pixel_style_objects[i]'
				)
				.connection-name-element(
					:class = 'connection_name_element_class_objects'
				) {{input_names[i]}}
				.connection-element(
					:class = 'connection_element_input_class_objects[i]'
					:title = 'input_titles[i]'
					@mousedown = 'on_input_mousedown($event, i)'
					@mouseup = 'on_input_mouseup($event, i)'
				)

		.outputs-container(
			v-if = 'has_outputs'
			:style = 'output_container_style_object'
			)
			.connection-pixel.output-pixel(
				v-for = 'output, i in available_outputs'
				:style = 'outputs_pixel_style_objects[i]'
				)
				.connection-name-element(
					:class = 'connection_name_element_class_objects'
				) {{output_names[i]}}
				.connection-element(
					:class = 'connection_element_output_class_objects[i]'
					:title = 'output_titles[i]'
					@mousedown = 'on_output_mousedown($event, i)'
					@mouseup = 'on_output_mouseup($event, i)'
				)

		Connection(
			v-for = 'connection, i in inputs'
			v-if = 'input_valid_states[i]'
			:key = 'i'
			:input_index = 'i'
			:output_index = 'input_connection_output_indices[i]'
			:src_json_node = 'input_json_nodes[i]'
			:dest_json_node = 'json_node'
		)
		NodeInfo(
			v-if = 'display_node_info'
			:graph_node_id = 'graph_node_id'
		)


</template>

<script lang="ts">
// internal lib
import {Constants} from '../helpers/Constants';

// mixins
import {SetupCapture} from './nodes/mixins/Capture';
import {SetupChildrenOwner} from './nodes/mixins/ChildrenOwner';
import {SetupCommentable} from './nodes/mixins/Commentable';
import {SetupContextMenu} from './nodes/mixins/ContextMenu';
import {SetupBypassFlag} from './nodes/mixins/BypassFlag';
import {SetupDisplayFlag} from './nodes/mixins/DisplayFlag';
import {SetupErrored} from './nodes/mixins/Errored';
import {SetupEventMouse} from './nodes/mixins/EventMouse';
// import {SetupEventKey} from './nodes/mixins/EventKey'
import {SetupIcon} from './nodes/mixins/Icon';
import {SetupInfos} from './nodes/mixins/Infos';
import {SetupInputs} from './nodes/mixins/Inputs';
import {SetupNamed} from './nodes/mixins/Named';
import {SetupOutputs} from './nodes/mixins/Outputs';
import {SetupPosition} from './nodes/mixins/Position';
import {SetupSelection} from './nodes/mixins/Selection';

// components
import Connection from './Connection.vue';
import NodeInfo from './NodeInfo.vue';

interface NodeProps {
	json_node: EngineNodeData;
	json_parent: EngineNodeData;
	action_in_progress: boolean;
}

import {defineComponent, computed, SetupContext} from '@vue/composition-api';
import {EngineNodeData} from '../../../../store/modules/Engine';
import {StoreController} from '../../../../store/controllers/StoreController';
export default defineComponent({
	name: 'network_node',
	components: {Connection, NodeInfo},
	props: {
		json_node: {
			type: Object,
		},
		json_parent: {
			type: Object,
		},
		action_in_progress: Boolean,
	},

	setup(props: NodeProps, context: SetupContext) {
		const node = StoreController.engine.node(props.json_node.graph_node_id);

		const graph_node_id = computed(() => props.json_node.graph_node_id);
		const layout_vertical = computed(() => {
			return node?.ui_data.is_layout_vertical() || false;
		});
		const style_object = computed(() => {
			// const pointer_events = this.selection_in_progress ? 'none' : 'auto';
			return {
				left: `${props.json_node.ui_data_json.x}px`,
				top: `${props.json_node.ui_data_json.y}px`,
				// pointerEvents: pointer_events,
			};
		});
		const body_size = computed(() => {
			return {
				x: node?.ui_data.width() || 100,
				y: Constants.NODE_UNIT,
			};
		});

		const bypass_options = SetupBypassFlag(props.json_node, body_size);
		const position_options = SetupPosition(props.json_node);
		const selection_options = SetupSelection(props.json_node, props.json_parent);
		const capture_options = SetupCapture(props.json_node, context);
		const infos_options = SetupInfos();

		const class_object = computed(() => {
			return {
				selected: selection_options.is_selected.value,
				is_being_moved: position_options.is_being_moved.value,
				bypassed: bypass_options.is_bypassed.value,
				layout_horizontal: !layout_vertical.value,
			};
		});

		const node_body_style_object = computed(() => {
			return {
				left: `${-0.5 * (node?.ui_data.width() || 0)}px`,
				top: `${-0.5 * Constants.NODE_HEIGHT}px`,
				width: `${body_size.value.x}px`,
				height: `${body_size.value.y}px`,
				// backgroundColor: Color.to_css(this.ui_data.color()),
				borderRadius: 3, //`${this.ui_data.border_radius()}px`
			};
		});

		return {
			layout_vertical,
			style_object,
			class_object,
			node_body_style_object,
			graph_node_id,
			// mixins
			...bypass_options,
			...SetupChildrenOwner(props.json_node, body_size, layout_vertical),
			...SetupContextMenu(props.json_node),
			...SetupCommentable(props.json_node, body_size, layout_vertical),
			...SetupContextMenu(props.json_node),
			...SetupDisplayFlag(props.json_node, body_size),
			...SetupErrored(props.json_node, body_size),
			...SetupEventMouse(props.json_node, context, capture_options, infos_options),
			...SetupIcon(props.json_node),
			...infos_options,
			...SetupInputs(props.json_node, body_size, layout_vertical),
			...SetupNamed(props.json_node, body_size, layout_vertical),
			...SetupOutputs(props.json_node, body_size, layout_vertical),
			...position_options,
			...selection_options,
		};
	},
});
</script>

<style lang="sass">

@import "globals.sass"

$color_node_body: lighten($color_bg_panel_network, 20%)
$color_node_body_bypassed: $color_bg_panel_network
$color_node_border_bypassed: darken($color_bg_panel_network, 5%)
$color_node_body_hover_border: darken($color_node_body, 50%)
$color_node_body_selected: #54ff00 //lighten($success-color, 5%)
$color_box_shadow: darken($color_bg_panel_network, 10%)
$color_box_shadow_moved: lighten($color_box_shadow, 0%)
$color_error_flag: $alert-color
$color_bypass_flag_on: yellow
$color_bypass_flag_off: white //mix($color_bg_panel_network, $color_bypass_flag_on, 95%)
$color_display_flag_on: $primary-color //#00d9ff //#2327d7 //darken(saturate($primary-color, 20%), 20%)
$color_display_flag_off: white //mix($color_bg_panel_network, $color_display_flag_on, 95%)
$color_bg_input: lighten($primary-color, 0%)
$color_border_input: darken($color_bg_input, 40%)
$color_bg_output: darken($success-color, 0%)
$color_border_output: darken($color_bg_output, 40%)


$connection_size_default: 12px
$connection_size_hover: 16px

$z_index_body: 8 // to be higher than name
$z_index_flag_container: 9
$z_index_name: 5
$z_index_comment: 4
$z_index_enter_button: 6
$z_index_connection_element: 20
$z_index_connection_name: 19
$z_index_connection_hover: 999
$z_index_connection_name_non_named: 21

.NetworkNode
	position: absolute
	width: 0px
	height: 0px
	// transform: translate(-50%, -50%)
	&.selected
		.node-body
			border: 3px solid $color_node_body_selected !important
	&.is_being_moved
		.node-body
			box-shadow: 4px 4px 8px $color_box_shadow_moved
	&.bypassed
		.node-body
			// opacity: 0.4
			background-color: $color_node_body_bypassed
			border: 3px solid $color_node_border_bypassed
			.icon-container
				opacity: 0.2
		.name-container, .comment-container
			opacity: 0.4
	&.layout_horizontal
		.name-container
			transform: translateY(-100%)
			.name-element
				margin: 0
		.inputs-container
			position: absolute
			.output-pixel
				// top: 10px
				left: 100%
				// .output-element
		.outputs-container
			position: absolute
			.output-pixel
				top: 10px
				left: 100%
				// .output-element


	.node-body
		position: absolute
		background-color: $color_node_body
		border-radius: 3px
		// box-shadow: 1px 1px 2px $color_box_shadow
		// border: 1px solid transparent
		cursor: move
		z-index: $z_index_body
		&:hover
			border: 1px solid $color_node_body_hover_border

		.icon-container
			opacity: 0.5
			margin: auto
			text-align: center
			height: 100%
			svg
				position: relative
				top: 50%
				transform: translateY(-50%)

	.error-flag-container
		position: absolute
		pointer-events: none
		.error-flag
			position: absolute
			left: -80px
			margin-right: 20px
			color: $color_error_flag

	.flag-container
		position: absolute
		z-index: $z_index_flag_container
		.node-flag
			position: absolute
			width: 10px
			cursor: pointer
			&.bypass-flag
				left: 0px
				&.on
					background-color: $color_bypass_flag_on
				&.off
					background-color: $color_bypass_flag_off
			&.display-flag
				right: 0px
				&.on
					background-color: $color_display_flag_on
				&.off
					background-color: $color_display_flag_off

	.name-container
		position: absolute
		transform: translateY(-50%)
		z-index: $z_index_name
		.name-element
			margin-left: 10px
			cursor: text
	.comment-container
		position: absolute
		// transform: translateY(-50%)
		width: 200px
		z-index: $z_index_comment
		.comment-element
			font-size: 0.8rem
			margin-left: 10px
			margin-top: -10px
			padding: 5px
			background-color: lightblue
			$comment_border_radius: 5px
			border-top-right-radius: $comment_border_radius
			border-bottom-right-radius: $comment_border_radius
			border-bottom-left-radius: $comment_border_radius
	.enter-button-container
		position: absolute
		transform: translateY(-50%)
		z-index: $z_index_enter_button
		.enter-button
			margin-right: 10px
			padding: 5px
			border-radius: 25px
			width: 25px
			height: 25px
			text-align: center
			background-color: lightgreen
			cursor: pointer
			line-height: 0
			&:hover
				background-color: darken(lightgreen, 10%)
			svg
				display: inline-block
				margin: auto
				position: relative
				// top: 50%
				// transform: translateY(-50%)

	.connection-pixel
		position: absolute
		&:hover
			z-index: $z_index_connection_hover
			.connection-name-element
				&.non_named_element
					display: block
		.connection-name-element
			position: absolute
			pointer-events: none
			background-color: $color_node_body
			line-height: 1
			padding: 2px 4px
			border-radius: 2px
			border: 1px solid $color_bg_panel_network
			&.named_element
				z-index: $z_index_connection_name
				font-size: 0.5rem
			&.non_named_element
				z-index: $z_index_connection_name_non_named
				font-size: 0.8rem
				padding: 5px 10px
				display: none
				top: -20px
				left: 0px
				transform: translate(-50%, -100%)

		.connection-element
			width: $connection_size_default
			height: $connection_size_default
			border-radius: 100px
			transform: translate(-50%, -50%)
			position: relative
			z-index: $z_index_connection_element
			cursor: pointer
			&:hover
				width: $connection_size_hover
				height: $connection_size_hover
			&.bool
				background-color: $color_connection_bool !important
			&.int
				background-color: $color_connection_int !important
			&.float
				background-color: $color_connection_float !important
			&.vec2
				background-color: $color_connection_vec2 !important
			&.vec3
				background-color: $color_connection_vec3 !important
			&.vec4
				background-color: $color_connection_vec4 !important
			&.mat3
				background-color: $color_connection_mat3 !important
			&.color
				background-color: $color_connection_color !important

	.inputs-container
		position: absolute
		.input-pixel
			top: 0
			width: 0
			height: 0
			.connection-name-element
				&.named_element
					padding-left: 10px
					transform: translate(0%, -50%)
			.connection-element
				border: 1px solid $color_border_input
				background-color: $color_bg_input
				// top: -1*($connection_size_hover - $connection_size_default)
				// &:hover
				// 	top: -1.5*($connection_size_hover - $connection_size_default)

	.outputs-container
		position: absolute
		.output-pixel
			bottom: 0
			width: 0
			height: 0
			left: 50%
			.connection-name-element
				&.named_element
					padding-right: 10px
					transform: translate(-100%, -50%)
			.connection-element
				// left: 50%
				border: 1px solid $color_border_output
				background-color: $color_bg_output
				//&:hover
				//	bottom: -1.5*($connection_size_hover - $connection_size_default)
</style>
