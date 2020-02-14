<template lang='pug'>

	include /mixins.pug

	doctype html

	.Field.Button
		//- :style = 'style_object'
		button.button.expanded(
			@click.prevent = 'on_click'
			:tabindex = 'tabindex'
		) {{ json_param.name }}


</template>

<script lang='ts'>
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
// import {TabIndexMixin} from './mixin/TabIndex';
import {StoreController} from '../../../../../store/controllers/StoreController';
import {ButtonParam} from '../../../../../../engine/params/Button';

import {createComponent} from '@vue/composition-api';
export default createComponent({
	name: 'button-field',
	// mixins: [Field, TabIndexMixin],
	props: SetupFieldCommonProps,

	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)! as ButtonParam;
		const setup_field_common = SetupFieldCommon(props);

		// const color = computed(() => {
		// 	return param.options.color;
		// });
		// const style_object = computed(() => {
		// 	return {backgroundColor: color.value};
		// });

		function on_click(e: MouseEvent) {
			param.press_button();
		}

		return {
			// style_object,
			// color,
			on_click,
			...setup_field_common,
		};
	},
});
</script>

<style lang='sass'>
	// @import "globals.sass"

	// .Field.Button

</style>
