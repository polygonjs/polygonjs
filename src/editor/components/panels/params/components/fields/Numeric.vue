<template lang='pug'>

	include /mixins.pug

	doctype html

	.Field.Numeric(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)
		//- @wheel.stop.prevent = 'on_wheel'
		//- @paste = 'on_paste'
		//- @mouseup = 'ensure_no_paste_from_middle_click'

		//- those events block were an attempt to prevent file save (as html)
		//- but they also prevent to write in the field, so not good
		//- and I still need to have them, otherwise copy pasting text also paste nodes
		//- and pressing space toggles play
		//- @keypress.stop.prevent = ''
		//- @keyup.stop.prevent = ''
		//- @keydown.stop.prevent = ''

		input.value(
			:class = 'input_value_class_object'
			:value = 'value_or_expression'
			@keypress.stop = ''
			@keyup.stop = ''
			@keydown.stop = ''
			@change.stop = 'on_update_value'
			@blur.stop = 'on_update_value'
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


</template>

<script lang='ts'>
// mixins
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
import {SetupGlobalSliderOwner} from './mixins/GlobalSliderOwner';
import {SetupContextMenu} from '../mixins/ContextMenu';

import {StoreController} from '../../../../../store/controllers/StoreController';

import {createComponent} from '@vue/composition-api';
export default createComponent({
	name: 'numeric-field',
	props: SetupFieldCommonProps,
	// mixins: [Field, GlobalSliderOwner, ContextMenu, TabIndexMixin],

	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)!;

		return {
			...SetupFieldCommon(props.json_param),
			...SetupGlobalSliderOwner(props.json_param),
			...SetupContextMenu(props.json_param, param),
		};
	},
});
</script>

<style lang='sass'>
	

</style>
