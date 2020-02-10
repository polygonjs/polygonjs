<template lang='pug'>

	include /mixins.pug

	doctype html

	.NetworkNodeInfoSopCache

		.buttons
			.button.expanded(@click = 'copy_cache') Copy Cache



</template>

<script lang='ts'>
import {CacheSopNode} from 'src/engine/nodes/sop/Cache';
import {ClipboardHelper} from 'src/editor/helpers/Clipboard';
import {StoreController} from '../../../../../../store/controllers/StoreController';

import {createComponent} from '@vue/composition-api';
export default createComponent({
	name: 'network_node_info_sop_cache',
	props: {
		graph_node_id: null,
	},

	setup(props) {
		const node = StoreController.engine.node(props.graph_node_id)! as CacheSopNode;

		function copy_cache() {
			const value: string = node.pv.cache;
			const clipboard_helper = new ClipboardHelper();
			clipboard_helper.copy(value);
			// this.$store.commit('editor/status_bar/notice', `Copied cache to clipboard`)
		}

		return {copy_cache};
	},
});
</script>

<style lang='sass'>

	@import "globals.sass"

	.NetworkNodeInfoMatShaderBuilder
		.button
			margin-bottom: 5px

</style>
