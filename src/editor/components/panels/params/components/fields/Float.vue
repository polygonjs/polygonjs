<template lang='pug'>

	include /mixins.pug

	doctype html

	.Field.Float(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)
		.grid-x
			.cell.auto
				//- @wheel.stop.prevent = 'on_wheel'
				//- @paste = 'on_paste'
				//- @mouseup = 'ensure_no_paste_from_middle_click'
				input.value(
					:class = 'input_value_class_object'
					:value = 'raw_input'
					@keypress.stop = ''
					@keyup.stop = ''
					@keydown.stop = ''
					@change.stop = 'on_update_value'
					@focus.stop = 'on_focus'
					@blur.stop = 'on_blur'
					type = 'text'
					@mousedown = 'open_numeric_slider'
					@paste = 'on_paste'
					@click.ctrl = 'reset_to_default'
					:title = 'error_message'
					:tabindex = 'tabindex'
					)
				input.expression_result(
					:value = 'value'
					readonly
					type = 'text'
					:title = 'value'
					:tabindex = 'tabindex'
					)

			.cell.small-10.slider_container(v-if = 'display_slider')
				input(
					type = 'range'
					:min = 'param_range[0]'
					:max = 'param_range[1]'
					:step = 'slider_step'
					:value = 'value'
					@mousedown = 'on_slider_mousedown'
					@mouseup = 'on_slider_mouseup'
					@change = 'on_slider_change'
					@input = 'on_slider_drag'
					:tabindex = 'tabindex'
					)


</template>

<script lang='ts'>
// mixins
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
import {SetupGlobalSliderOwner} from './mixins/GlobalSliderOwner';
import {SetupContextMenu} from '../mixins/ContextMenu';
import {SetupNumericSlider} from './mixins/NumericSlider';

import {StoreController} from '../../../../../store/controllers/StoreController';
import {FloatParam} from '../../../../../../engine/params/Float';

import {createComponent, computed, ref} from '@vue/composition-api';
export default createComponent({
	name: 'float-field',
	props: SetupFieldCommonProps,
	// mixins: [Field, GlobalSliderOwner, ContextMenu, TabIndexMixin],
	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)! as FloatParam;
		const setup_field_common = SetupFieldCommon(props);

		const text_input_focused = ref(false);

		const param_range = computed(() => {
			return param.options.range;
		});
		const slider_step = computed(() => {
			return param.options.step || 0.01;
		});

		const display_slider = computed(() => {
			return !text_input_focused.value;
		});

		// functions
		function on_focus() {
			if (param.has_expression()) {
				text_input_focused.value = true;
			}
		}
		function on_blur(e: Event) {
			text_input_focused.value = false;
			setup_field_common.on_update_value(e);
		}

		return {
			param_range,
			slider_step,
			display_slider,
			// functions
			on_focus,
			on_blur,
			// mixins
			...setup_field_common,
			...SetupNumericSlider(props.json_param, param),
			...SetupGlobalSliderOwner(props.json_param),
			...SetupContextMenu(props.json_param, param),
		};
	},
});
</script>

<style lang='sass'>

	// .Field.Float



</style>
