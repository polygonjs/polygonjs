<template lang='pug'>

	include /mixins.pug

	doctype html

	.NetworkNodeInfoGl

		.buttons
			.button.expanded(
				v-for = 'shader_name, i in shader_names'
				@click = 'copy_shader(shader_name)'
				) Copy Shader {{shader_name}}



</template>

<script lang='ts'>
import {BaseGlNodeType} from 'src/engine/nodes/gl/_Base';
import {StoreController} from '../../../../../../store/controllers/StoreController';

import {ClipboardHelper} from 'src/editor/helpers/Clipboard';

import {AssemblerControllerNode} from '../../../../../../../engine/nodes/gl/Assembler/Controller';
import {ShaderName} from '../../../../../../../engine/nodes/utils/shaders/ShaderName';
import {createComponent, ref, Ref, onMounted, computed} from '@vue/composition-api';
export default createComponent({
	name: 'network_node_info_sop_particles_system_gpu',
	props: {
		graph_node_id: null,
	},

	setup(props) {
		const node = StoreController.engine.node(props.graph_node_id)! as BaseGlNodeType;

		const shaders_by_name = ref<Dictionary<string>>({});
		const shader_names: Readonly<Ref<readonly string[]>> = computed(() => {
			return Object.keys(shaders_by_name.value);
		});

		onMounted(() => {
			set_shaders_by_name();
		});

		async function set_shaders_by_name() {
			const assembler_node: AssemblerControllerNode | undefined = node.material_node;
			if (assembler_node) {
				await assembler_node.request_container();
				const assembler_shaders_by_name: Map<ShaderName, string> =
					assembler_node.assembler_controller.shaders_by_name;

				assembler_shaders_by_name.forEach((shader, shader_name) => {
					shaders_by_name.value[shader_name] = shader;
				});
			}
		}
		function copy_shader(shader_name: string) {
			ClipboardHelper.copy(shaders_by_name.value[shader_name]);
			// this.$store.commit('editor/status_bar/notice', `Copied ${shader_name} shader to clipboard`);
		}

		return {
			shaders_by_name,
			shader_names,
			copy_shader,
		};
	},
});
</script>

<style lang='sass'>

	@import "globals.sass"

	.NetworkNodeInfoGl
		.button
			margin-bottom: 5px

</style>
