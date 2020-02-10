<template lang='pug'>

	include /mixins.pug

	doctype html

	.NetworkNodeInfoCop(
		)

		.node_info_cop_section.inline.resolution(v-if = 'resolution')
			.node_info_cop_section_title resolution:
			.node_info_cop_section_content
				span {{resolution}}



</template>

<script lang='ts'>
import {BaseCopNodeType} from 'src/engine/nodes/cop/_Base';
import {StoreController} from '../../../../../../store/controllers/StoreController';
import {Texture} from 'three/src/textures/Texture';

interface CopInfoProps {
	graph_node_id: string;
}

import {createComponent, ref, onMounted} from '@vue/composition-api';
export default createComponent({
	name: 'network_node_info_cop',
	props: {
		graph_node_id: {
			type: String,
		},
	},

	setup(props: CopInfoProps) {
		const node = StoreController.engine.node(props.graph_node_id)! as BaseCopNodeType;
		const resolution = ref<Number2>([0, 0]);

		onMounted(() => {
			compute_node();
		});

		async function compute_node() {
			const container = await node.request_container();

			const texture: Texture = container.core_content();
			console.log('texture', texture);

			const res = container.resolution();
			resolution.value[0] = res[0];
			resolution.value[1] = res[1];
		}

		return {resolution};
	},
});
</script>

<style lang='sass'>

	@import "globals.sass"

	$color_table_border: black

	.NetworkNodeInfoCop

		.bbox_infos
			table
				margin-top: 10px
				td
					border: 1px solid $color_table_border
					text-align: center
					padding: 0px 5px
					&.number
						white-space: nowrap
				// tr.odd

		.node_info_cop_section
			white-space: nowrap
			&.inline
				.node_info_cop_section_title
					display: inline-block
					margin-right: 5px
				.node_info_cop_section_content
					display: inline-block


</style>
