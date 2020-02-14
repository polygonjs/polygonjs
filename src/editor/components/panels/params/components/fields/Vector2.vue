<template lang='pug'>

	include /mixins.pug

	doctype html

	.Field.Multiple.Vector.grid-x
		.cell(
			v-for = 'json_component, i in json_components'
			:class = 'cell_class_object'
			:key = 'i'
		)
			Numeric(
				:json_param = 'json_component'
				:displays_expression_result = 'displays_expression_result'
				:tabindex = 'tabindex+i'
			)



</template>

<script lang='ts'>
// mixins
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
import {SetupMultipleParamCommon} from './mixins/MultipleParamCommon';
import {SetupGlobalSliderOwner} from './mixins/GlobalSliderOwner';
import {SetupContextMenu} from '../mixins/ContextMenu';
import {StoreController} from '../../../../../store/controllers/StoreController';
import {Vector2Param} from '../../../../../../engine/params/Vector2';

// components
import Numeric from './Numeric.vue';

import {createComponent} from '@vue/composition-api';
export default createComponent({
	name: 'vector2-field',
	// mixins: [Field, TabIndexMixin],
	props: SetupFieldCommonProps,
	components: {Numeric},
	setup(props: ISetupFieldCommonProps) {
		const param = StoreController.engine.param(props.json_param.graph_node_id)! as Vector2Param;
		const setup_field_common = SetupFieldCommon(props);

		return {
			// mixins
			...setup_field_common,
			...SetupMultipleParamCommon(props.json_param),
			...SetupGlobalSliderOwner(props.json_param),
			...SetupContextMenu(props.json_param, param),
		};
	},
});
</script>

<style lang='sass'>

	// .Field.Vector

</style>
