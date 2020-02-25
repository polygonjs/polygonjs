<template lang="pug">

	include /mixins.pug

	doctype html

	.Field.Multiple.Color.grid-x
		.cell.shrink
			input(
				type = 'color'
				name = "color_input_name"
				v-model = 'input_color'
				:tabindex = 'tabindex+1'
				)
		.cell.auto
			.grid-x
				.cell(
					v-for = 'json_component, i in json_components'
					:class = 'cell_class_object'
					:key = 'i'
					)
					Numeric(
					:json_param = 'json_component'
					:displays_expression_result = 'displays_expression_result'
					:tabindex = 'tabindex+1+i'
					)



</template>

<script lang="ts">
import {Color} from 'three/src/math/Color';

// mixins
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
import {SetupMultipleParamCommon} from './mixins/MultipleParamCommon';

// components
import Numeric from './Numeric.vue';
import {ColorParam} from '../../../../../../engine/params/Color';
import {StoreController} from '../../../../../store/controllers/StoreController';

import {defineComponent, computed, onMounted, ref, watch} from '@vue/composition-api';
export default defineComponent({
	name: 'color-field',
	props: SetupFieldCommonProps,
	components: {Numeric},

	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)! as ColorParam;
		const setup_field_common = SetupFieldCommon(props);
		const init_color_style = param.value.getStyle();
		const input_color = ref(init_color_style);

		onMounted(() => {
			update_input_color_from_param();
		});

		const color_input_name = computed(() => {
			return `color_input_${param.full_path()}`;
		});
		const color_value = computed(() => {
			return props.json_param.value as Number3;
		});

		// update color html input element element from color
		const input_color_w = new Color();
		watch(color_value, async (new_color, old_color) => {
			input_color_w.fromArray(new_color);
			const new_style = input_color_w.getHexString();
			input_color.value = `#${new_style}`;
		});

		// update color from color html input element
		const input_color_c = new Color();
		watch(input_color, (new_color) => {
			if (!param.has_expression()) {
				input_color_c.setStyle(new_color);
				// const color = new Color(new_color);
				if (!param.is_raw_input_equal(input_color_c)) {
					param.set(input_color_c);
				}
			}
		});

		async function update_input_color_from_param() {
			if (param.is_dirty) {
				param.compute();
			}
			const value = param.value;
			input_color.value = `#${value.getHexString()}`;
		}

		return {
			input_color,
			color_input_name,
			...SetupMultipleParamCommon(props.json_param),
			...setup_field_common,
		};
	},
});
</script>

<style lang="sass">

.Field.Color
	input[type=color]
		cursor: pointer
		width: 30px
		height: 100%
		padding: 0px
		margin-right: 5px
</style>
