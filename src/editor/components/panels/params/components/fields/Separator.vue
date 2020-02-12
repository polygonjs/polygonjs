<template lang='pug'>

	include /mixins.pug

	doctype html

	.Field.Separator
		.horizontal-border

</template>

<script lang='ts'>
// mixins
import {SetupFieldCommon, ISetupFieldCommonProps, SetupFieldCommonProps} from './mixins/FieldCommon';
// import { SeparatorParam } from '../../../../../../engine/params/Separator';

import {createComponent} from '@vue/composition-api';
export default createComponent({
	name: 'separator-field',
	props: SetupFieldCommonProps,
	// mixins: [Field]
	setup(props: ISetupFieldCommonProps) {
		// StoreController.engine.param(props.json_param.graph_node_id)! as SeparatorParam;
		const setup_field_common = SetupFieldCommon(props.json_param);

		return {
			...setup_field_common,
		};
	},
});
</script>

<style lang='sass'>

	.Field.Separator
		.horizontal-border
			height: 2px
			background-color: darkgray
			margin: 10px

</style>
