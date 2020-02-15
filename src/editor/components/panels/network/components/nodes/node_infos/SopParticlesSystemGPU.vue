<template lang='pug'>

	include /mixins.pug

	doctype html

	.NetworkNodeInfoSopParticlesSystemGPU

		.buttons
			.button.expanded(
				v-for = 'shader_name, i in shader_names'
				@click = 'copy_shader(shader_name)'
				) Copy Shader {{shader_name}}



</template>

<script lang='ts'>
import {ParticlesSystemGpuSopNode} from 'src/engine/nodes/sop/ParticlesSystemGpu';
import {ClipboardHelper} from 'src/editor/helpers/Clipboard';

import {StoreController} from '../../../../../../store/controllers/StoreController';
import {createComponent, computed, ref, Ref, onMounted} from '@vue/composition-api';
import {ShaderName} from '../../../../../../../engine/nodes/utils/shaders/ShaderName';
export default createComponent({
	name: 'network_node_info_sop_particles_system_gpu',
	props: {
		graph_node_id: null,
	},

	setup(props) {
		const node = StoreController.engine.node(props.graph_node_id)! as ParticlesSystemGpuSopNode;

		const shaders_by_name = ref<Dictionary<string>>({});
		const shader_names: Readonly<Ref<readonly string[]>> = computed(() => {
			return Object.keys(shaders_by_name.value);
		});

		onMounted(() => {
			set_shaders_by_name();
		});

		async function set_shaders_by_name() {
			await node.request_container();

			const assembler_shaders_by_name: Map<ShaderName, string> = node.assembler_controller.shaders_by_name;

			assembler_shaders_by_name.forEach((shader, shader_name) => {
				shaders_by_name.value[shader_name] = shader;
			});
		}
		function copy_shader(shader_name: string) {
			ClipboardHelper.copy(shaders_by_name.value[shader_name]);
			// this.$store.commit('editor/status_bar/notice', `Copied ${shader_name} shader to clipboard`);
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

	.NetworkNodeInfoSopParticlesSystemGPU
		.button
			margin-bottom: 5px

</style>
