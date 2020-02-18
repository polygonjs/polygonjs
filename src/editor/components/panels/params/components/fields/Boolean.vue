<template lang='pug'>

	include /mixins.pug

	doctype html

	.Field.Toggle.grid-x(
		:class = 'class_object'
		@contextmenu = 'on_contextmenu'
		)
		.cell.shrink
			input(
				type = 'checkbox'
				@change = 'on_checkbox_update'
				:checked = 'value'
				:tabindex = 'tabindex'
			)
			//- .switch
			//- 	input.switch-input(
			//- 		:id = 'checkbox_id'
			//- 		type= 'checkbox'
			//- 		@change = 'on_checkbox_update'
			//- 		:checked = 'param_result'
			//- 	)
			//- 	label.switch-paddle.disable-select(
			//- 		:for="checkbox_id"
			//- 		:style='style_object'
			//- 	)
		.cell.auto
			Numeric(
				v-if = 'is_field_visible'
				:json_param = 'json_param'
				:displays_expression_result = 'displays_expression_result'
				:tabindex = 'tabindex+1'
			)
			label.disable-select(
				v-else
				@click = 'toggle_param'
			) {{name}}


</template>

<script lang='ts'>
// mixins
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
import {SetupContextMenu} from '../mixins/ContextMenu';
import {StoreController} from '../../../../../store/controllers/StoreController';
import {BooleanParam} from '../../../../../../engine/params/Boolean';

// components
import Numeric from './Numeric.vue';
import {ParamSetCommand} from '../../../../../history/commands/ParamSet';

import {createComponent, computed, onMounted} from '@vue/composition-api';
export default createComponent({
	name: 'boolean-field',
	//mixins: [Field, ContextMenu, TabIndexMixin],
	props: SetupFieldCommonProps,
	components: {Numeric},
	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)! as BooleanParam;
		const setup_field_common = SetupFieldCommon(props);

		// const param_result = ref(false)

		onMounted(() => {
			if (param.is_dirty) {
				param.compute();
			}
		});

		const checkbox_id = computed(() => {
			return `checkbox_${props.json_param.graph_node_id}`;
		});
		// const checked_color = computed(()=>{
		// 	return this.param.color() || '#1779ba';
		// })
		// const default_color = computed(()=>{
		// 	return '#cacaca';
		// })
		const checked = computed(() => {
			return props.json_param.value;
		});
		// const style_object = computed(()=>{
		// 	let style;
		// 	return (style = {
		// 		backgroundColor: this.checked_color,
		// 		opacity: this.checked ? 1 : 0.3,
		// 	});
		// })

		// watch(value, (new_value)=>{
		// 	this.param_result = this.param.value
		// })
		// watch(expression,(new_value)=>{
		// 	eval_param()
		// })

		// functions
		function on_checkbox_update(e: Event) {
			const target = e.target as HTMLInputElement;
			if (target) {
				let new_value = target.checked;
				// new_value = new_value ? 1 : 0;
				const cmd = new ParamSetCommand(param, new_value);
				cmd.push();
			}
		}

		function toggle_param() {
			let new_value = !param.value;
			// new_value = new_value ? 1 : 0;
			const cmd = new ParamSetCommand(param, new_value);
			cmd.push();
			// return new History.Command.ParamSet(this.param, {value: new_value}).push(this);
		}

		// function eval_param() {
		// 	param.compute()
		// 	// return this.param.eval().then((value) => {
		// 	// 	return (this.param_result = this.param.value_to_boolean(value));
		// 	// });
		// }

		return {
			checkbox_id,
			checked,
			// param_result,
			// functions
			on_checkbox_update,
			toggle_param,
			// mixins
			...setup_field_common,
			...SetupContextMenu(props.json_param, param),
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	.Field.Toggle
		input.value
			display: block
		input.expression_result
			display: none
		&.displays_expression_result
			input.value
				display: none
			input.expression_result
				display: block

		input
			margin: 0px
			&.has_expression
				background-color: mix($color_bg, lightgreen, 50%)

		input[type=checkbox]
			// margin-top: 13px
			$checkbox_scale: 1.4
			cursor: pointer
			-ms-transform: scale($checkbox_scale) /* IE */
			-moz-transform: scale($checkbox_scale) /* FF */
			-webkit-transform: scale($checkbox_scale) /* Safari and Chrome */
			-o-transform: scale($checkbox_scale) /* Opera */
			transform: scale($checkbox_scale)
			// padding: 10px;
			margin-right: 5px
			position: relative
			top: 2px

		label
			padding: 5px
			cursor: pointer

		// .switch
		// 	margin-bottom: 0px
		// 	padding:
		// 		// top: 3px
		// 		right: 5px

</style>
