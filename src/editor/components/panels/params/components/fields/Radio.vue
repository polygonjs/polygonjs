<template lang='pug'>

	include /mixins.pug

	doctype html

	.Field.Radio
		.radio_inputs_container
			select.select(
				ref = 'select'
				@change = 'set_from_select'
				:tabindex = 'tabindex'
				)
				option(
					v-for = 'entry, i in entries'
					:key = 'i'
					:value = 'entry.value'
					:selected = 'selected_states[i]'
				) {{entry.name}}
			// .radio_input_container(
			// 	v-for = 'entry, i in entries'
			// 	:key = 'i'

			// 	)
			// 	.grid-x
			// 		.cell.shrink
			// 			.switch
			// 				input.switch-input(
			// 					:id = 'radio_ids[i]'
			// 					type= 'checkbox'
			// 					@change = 'set_from_radio(i)'
			// 					:checked = 'radio_checked_statuses[i]'
			// 				)
			// 				label.switch-paddle(
			// 					:style = 'style_objects[i]'
			// 					:for='radio_ids[i]'
			// 				)
			// 		.cell.auto
			// 			label(
			// 				:for = 'radio_ids[i]'
			// 				@click = 'set_from_radio(i)'
			// 			) {{entry.name}}

			//- input(
			//- 	:name = 'radio_name'
			//- 		type = 'radio'
			//- 	:id = 'radio_ids[i]'
			//- 	:value = 'entry.value'
			//- 	:checked = 'radio_checked_statuses[i]'
			//- 	@click = 'set_from_radio(i)'
			//- )



</template>

<script lang='ts'>
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
import {SetupContextMenu} from '../mixins/ContextMenu';
import {StoreController} from '../../../../../store/controllers/StoreController';
import {ParamSetCommand} from '../../../../../history/commands/ParamSet';

import {createComponent, computed, ref} from '@vue/composition-api';
export default createComponent({
	name: 'radio-field',
	props: SetupFieldCommonProps,
	// mixins: [Field, TabIndexMixin],

	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)!;
		const setup_field_common = SetupFieldCommon(props);

		const select = ref<HTMLSelectElement | null>(null);

		const entries = computed(() => {
			return param.options.menu_entries;
		});
		const selected_states = computed(() => {
			return entries.value.map((entry) => {
				return entry.value === param.value;
			});
		});

		function set_from_select() {
			if (select.value) {
				const value = select.value.value;
				const cmd = new ParamSetCommand(param as any, value);
				cmd.push();
			}
		}

		return {
			select,
			entries,
			selected_states,
			set_from_select,
			...setup_field_common,
			...SetupContextMenu(props.json_param, param),
		};
	},
});
// set_from_radio: (index)->
// 	entry = this.entries[index]
// 	value = entry['value']
// 	(new History.Command.ParamSet(this.param, {value: value})).push(this)
</script>

<style lang='sass'>

	.Field.Radio
		input, label
			cursor: pointer

		// .switch
		// 	padding:
		// 		top: 3px
		// 		right: 5px

		select.select
			margin-bottom: 0

		label
			padding:
				top: 5px
				left: 10px


</style>
