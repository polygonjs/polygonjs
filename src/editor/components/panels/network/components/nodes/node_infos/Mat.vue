<template lang='pug'>

	include /mixins.pug

	doctype html

	.NetworkNodeInfoMat

		.buttons
			.button.expanded(
				v-for = 'shader_name, i in shader_names'
				@click = 'copy_shader(shader_name)'
				) Copy {{shader_name}} Shader



</template>

<script lang='ts'>
import {ClipboardHelper} from 'src/editor/helpers/Clipboard';

import {createComponent, ref, Ref, onMounted, computed} from '@vue/composition-api';
import {StoreController} from '../../../../../../store/controllers/StoreController';
import {AssemblerControllerNode} from '../../../../../../../engine/nodes/gl/Assembler/Controller';
import {ShaderName} from '../../../../../../../engine/nodes/utils/shaders/ShaderName';
export default createComponent({
	name: 'network_node_info_sop_particles_system_gpu',
	props: {
		graph_node_id: null,
	},

	setup(props) {
		const node = StoreController.engine.node(props.graph_node_id)! as AssemblerControllerNode;

		const shaders_by_name = ref<Dictionary<string>>({});
		const shader_names: Readonly<Ref<readonly string[]>> = computed(() => {
			return Object.keys(shaders_by_name.value);
		});

		onMounted(() => {
			set_shaders_by_name();
		});

		async function set_shaders_by_name() {
			if (node.assembler_controller) {
				await node.request_container();
				const assembler_shaders_by_name: Map<ShaderName, string> = node.assembler_controller.shaders_by_name;

				assembler_shaders_by_name.forEach((shader, shader_name) => {
					shaders_by_name.value[shader_name] = shader;
				});
			}
		}
		function copy_shader(shader_name: string, escaped = false) {
			let text = shaders_by_name.value[shader_name];
			if (escaped) {
				text = text.replace(/(\t)/gm, ' ');
				text = text.replace(/(\r\n|\n|\r)/gm, '\\n');
				text = text.replace(/"/gm, '');
			}

			ClipboardHelper.copy(text);
			// this.$store.commit('editor/status_bar/notice', `Copied ${shader_name} shader to clipboard`)
		}

		return {
			shader_names,
			copy_shader,
		};
	},
});
</script>

<style lang='sass'>

	@import "globals.sass"

	.NetworkNodeInfoMat
		.button
			margin-bottom: 5px

</style>
