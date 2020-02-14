<template lang='pug'>

	include /mixins.pug

	doctype html

	.ParamContainer.grid-x(
		v-if = 'param_visible'
		)
		.cell.small-3.text-right.param_name(
			:title = 'label_tooltip'
			@click = 'toggle_expression_mode'
			@mousedown = 'open_numeric_slider_if_numeric_or_color'
			@contextmenu = 'on_contextmenu'
		)
			label.disable-select(v-if = 'display_label') {{name}}

		.cell.small-9
			Component(
				:is = 'field_component_type'
				:json_param = 'json_param'
				:displays_expression_result = 'displays_expression_result'
				:tabindex = 'tabindex'
			)


</template>

<script lang='ts'>
import lodash_isString from 'lodash/isString';

// mixins
import {SetupGlobalSliderOwner} from './fields/mixins/GlobalSliderOwner';
// import Emit from './Mixin/Emit';
import {SetupContextMenu} from './mixins/ContextMenu';

// components
import BooleanField from './fields/Boolean.vue';
import ButtonField from './fields/Button.vue';
import ColorField from './fields/Color.vue';
import FloatField from './fields/Float.vue';
import IntegerField from './fields/Integer.vue';
import NumericField from './fields/Numeric.vue';
import OperatorPathField from './fields/OperatorPath.vue';
import RadioField from './fields/Radio.vue';
import SeparatorField from './fields/Separator.vue';
import StringField from './fields/String.vue';
import Vector2Field from './fields/Vector2.vue';
import Vector3Field from './fields/Vector3.vue';
import Vector4Field from './fields/Vector4.vue';
import RampField from './fields/Ramp.vue';

interface DescriptionMenuEntries {
	description: string;
	menu_entries: Dictionary<string>;
}

interface ParamsProps {
	json_param: EngineParamData;
	description?: string | DescriptionMenuEntries;
	tabindex: number;
}
import {EngineParamData} from '../../../../store/modules/Engine';
import {StoreController} from '../../../../store/controllers/StoreController';
import {ParamType} from '../../../../../engine/poly/ParamType';

import {createComponent, computed, onMounted, ref} from '@vue/composition-api';
export default createComponent({
	name: 'param-field-container',
	// mixins: [Emit, GlobalSliderOwner, ContextMenu],
	components: {
		BooleanField,
		ButtonField,
		ColorField,
		FloatField,
		IntegerField,
		NumericField,
		OperatorPathField,
		RadioField,
		SeparatorField,
		StringField,
		Vector2Field,
		Vector3Field,
		Vector4Field,
		RampField,
	},

	props: {
		json_param: {},
		description: {},
		tabindex: {
			default: -1,
			type: Number,
		},
	},

	setup(props: ParamsProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)!;

		const displays_expression_result = ref(false);

		onMounted(() => {
			param.options.update_visibility();
		});

		// const graph_node_id = computed(()=>{
		// 	return props.json_param.graph_node_id;
		// })
		const name = computed(() => {
			return props.json_param.name;
		});
		const type = computed(() => {
			return props.json_param.type;
		});
		// const value = computed(()=>{
		// 	return props.json_param.value;
		// })
		const human_description = computed(() => {
			if (props.description) {
				if (lodash_isString(props.description)) {
					return props.description;
				} else {
					const description_menu_entries = props.description['menu_entries'];
					let suffix = '';
					const entries_description: string[] = [];
					param.options.menu_entries.forEach((param_menu_entry) => {
						const entry_name = param_menu_entry['name'];
						const description_entry = description_menu_entries[entry_name];
						entries_description.push(`- ${entry_name}:\n${description_entry}`);
					});
					suffix = `\n\n${entries_description.join('\n\n')}`;
					return props.description['description'] + suffix;
				}
			}
		});

		const label_tooltip = computed(() => {
			if (human_description.value) {
				return `${name.value} (${type.value}: ${human_description.value})`;
			} else {
				return `${name.value} (${type.value})`;
			}
		});

		const field_component_type = computed(() => {
			let converted_type = type.value;
			switch (type.value) {
				case ParamType.INTEGER:
					if (param.options.has_menu_radio) {
						converted_type = 'radio';
					} else {
						converted_type = type.value;
					}
					break;
			}

			return `${converted_type.replace('_', '-')}-field`;
		});

		const param_visible = computed(() => {
			return props.json_param.is_visible;
		});

		const display_label = computed(() => {
			return !param.options.is_label_hidden;
		});

		// 	watch: {
		// 	graph_node_id() {
		// 		return param.update_visibility();
		// 	},
		// },
		// methods
		function toggle_expression_mode() {
			if (param.has_expression()) {
				displays_expression_result.value = !displays_expression_result.value;
			} else {
				displays_expression_result.value = false;
			}
			console.log('displays_expression_result', displays_expression_result.value);
		}

		const slider_options = SetupGlobalSliderOwner(props.json_param);
		function open_numeric_slider_if_numeric_or_color(e: MouseEvent) {
			if (param.is_numeric || param.type === ParamType.COLOR) {
				slider_options.open_numeric_slider(e);
			}
		}

		return {
			name,
			label_tooltip,
			field_component_type,
			param_visible,
			display_label,
			displays_expression_result,
			// functions
			toggle_expression_mode,
			open_numeric_slider_if_numeric_or_color,
			...slider_options,
			...SetupContextMenu(props.json_param, param),
		};
	},
});
</script>

<style lang='sass'>

	@import "globals.sass"

	$color_bg_hover: darken($color_bg_panel_param, 20%)
	$color_bg_expression: lighten(mix($color_bg, lightgreen, 50%), 20%)
	$color_bg_error: $alert-color

	.ParamContainer
		padding: 1px 0px
		overflow: hidden

		.param_menu_container
			position: relative
			height: 1px
			width: 100%
			background-color: red

		.param_name
			position: relative
			z-index: 1
			label
				font-size: 0.8rem
				color: $color_font
				cursor: pointer
				margin: 5px
				padding: 0rem 10px
				&:hover
					background-color: $color_bg_hover


		.Field
			position: relative
			z-index: 2
			input.value
				display: block
			input.expression_result
				display: none
			&.displays_expression_result
				input.value
					display: none
				input.expression_result
					display: block

			input, select
				margin: 0px
				padding: 0.2rem
				font-size: 0.8rem
				height: 2rem
				&.has_expression
					&:not(.is_errored)
						background-color: $color_bg_expression
				&.is_errored
					background-color: $color_bg_error

			.slider_container
				$handle_width: 16px
				$handle_height: 16px
				$handle_border_radius: 16px
				$handle_bg_color: $primary-color
				$handle_bg_color_hover: lighten($primary-color, 10%)
				// $handle_bg_white: url('/images/slider_handle.white.png')
				// $handle_bg_black: url('/images/slider_handle.black.png')
				// $handle_bg_size: $handle_height*1
				padding: 0px 10px
				input[type=range]
					width: 100%
					height: 100%
					padding: 0
					margin: 0
					// from: https://www.w3schools.com/howto/howto_js_rangeslider.asp
					-webkit-appearance: none  /* Override default CSS styles */
					appearance: none
					outline: none
					background-color: transparent
					
					// -webkit-transition: .2s
					// transition: opacity .2s
					// background-color: white
					&:hover
						&::-webkit-slider-thumb
							background-color: $handle_bg_color_hover
						&::-moz-range-thumb
							background-color: $handle_bg_color_hover
					&::-webkit-slider-thumb
						-webkit-appearance: none /* Override default look */
						appearance: none
						position: relative
						top: -7px
						width: $handle_width
						height: $handle_height
						border-radius: $handle_border_radius
						background-color: $handle_bg_color
						cursor: pointer
					&::-moz-range-thumb
						-webkit-appearance: none /* Override default look */
						appearance: none
						position: relative
						top: -7px
						width: $handle_width
						height: $handle_height
						border-radius: $handle_border_radius
						background-color: $handle_bg_color
						cursor: pointer
					&::-webkit-slider-runnable-track
						width: 100%
						height: 2px
						background: white
					&::-moz-range-track
						width: 100%
						height: 2px
						background: white


		.Field.Multiple.grid-x
			.cell
				.Field.Numeric:not:first-child
					padding-left: 2px

</style>
