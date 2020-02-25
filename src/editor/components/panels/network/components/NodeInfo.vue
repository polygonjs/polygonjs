<template lang="pug">

	include /mixins.pug

	doctype html

	.NetworkNodeInfo(
		@mousedown.stop = ''
		@mouseup.stop = ''
		@dblclick.stop = ''
		)
		.arrow-left

		.node_title_container(@click = 'on_name_click') {{node_name}}
		.node_info_container
			.time_dependency.icon_prefixed(:class = 'time_dependency_class_object')
				v-icon(name = 'regular/clock')
				span {{time_dependency_label}}

			.error_message.icon_prefixed(v-if = 'error_message')
				v-icon(name = 'exclamation-triangle')
				span {{error_message}}
			.test(v-else) not errored

			.node_info_separator

			Component(
				v-if = 'current_node_info_type'
				:is = "current_node_info_type"
				:graph_node_id = 'graph_node_id'
			)
			.node_info_separator(v-if = 'current_node_info_type')

			.dependencies
				.dependencies_section.dependencies_predecessors
					.dependencies_section_title PREDECESSORS:
					.dependencies_list
						.dependendies_item(
							v-for = 'node_path, i in scene_predecessor_paths'
							@click = 'go_to_node_path(node_path)'
							) {{node_path}}
				.dependencies_section.dependencies_successors
					.dependencies_section_title SUCCESSORS:
					.dependencies_list
						.dependendies_item(
							v-for = 'node_path, i in scene_successor_paths'
							@click = 'go_to_node_path(node_path)'
							) {{node_path}}


</template>

<script lang="ts">
// libs
import {NodeContext} from 'src/engine/poly/NodeContext';
import {BaseNodeType} from 'src/engine/nodes/_Base';

// node
import {CacheSopNode} from 'src/engine/nodes/sop/Cache';
import {ParticlesSystemGpuSopNode} from 'src/engine/nodes/sop/ParticlesSystemGpu';

// components
import NodeInfoSop from './nodes/node_infos/Sop.vue';
import NodeInfoMat from './nodes/node_infos/Mat.vue';
import NodeInfoGl from './nodes/node_infos/Gl.vue';
import NodeInfoCop from './nodes/node_infos/Cop.vue';
import NodeInfoSopCache from './nodes/node_infos/SopCache.vue';
import NodeInfoSopParticlesSystemGPU from './nodes/node_infos/SopParticlesSystemGPU.vue';

const COMPONENTS_BY_NODE_CONTEXT: Map<NodeContext, any> = new Map();
COMPONENTS_BY_NODE_CONTEXT.set(NodeContext.SOP, NodeInfoSop);
COMPONENTS_BY_NODE_CONTEXT.set(NodeContext.MAT, NodeInfoMat);
COMPONENTS_BY_NODE_CONTEXT.set(NodeContext.GL, NodeInfoGl);
COMPONENTS_BY_NODE_CONTEXT.set(NodeContext.COP, NodeInfoCop);

const COMPONENTS_BY_NODE_CONTEXT_AND_TYPE: Map<NodeContext, Map<string, any>> = new Map([
	[
		NodeContext.SOP,
		new Map<string, any>([
			[CacheSopNode.type(), NodeInfoSopCache],
			[ParticlesSystemGpuSopNode.type(), NodeInfoSopParticlesSystemGPU],
		]),
	],
]);

// COMPONENTS_BY_NODE_CONTEXT_AND_TYPE[NodeContext.MAT] = {}
// COMPONENTS_BY_NODE_CONTEXT_AND_TYPE[NodeContext.MAT][ShaderBuilder.type()] = NodeInfoMatShaderBuilder
import {StoreController} from '../../../../store/controllers/StoreController';
import {NodeSetNameCommand} from '../../../../history/commands/NodeSetName';

import {defineComponent, ref, computed, onMounted} from '@vue/composition-api';
export default defineComponent({
	name: 'network_node_info',
	components: {NodeInfoSop},
	props: {
		graph_node_id: {
			type: String,
			default: null,
		},
	},

	setup(props) {
		const node = StoreController.engine.node(props.graph_node_id);

		const time_dependent = ref(false);
		const error_message = ref<string | undefined>(undefined);
		const scene_predecessor_paths = ref<string[]>([]);
		const scene_successor_paths = ref<string[]>([]);
		const node_by_path: Map<string, BaseNodeType> = new Map();

		const node_name = computed(() => node?.name);

		onMounted(() => {
			compute_node();
		});

		const time_dependency_label = computed(() => {
			return 'time dependent: ' + (time_dependent.value ? 'YES' : 'NO');
		});
		const time_dependency_class_object = computed(() => {
			return {time_dependent: time_dependent.value};
		});
		const current_node_info_type = computed(() => {
			if (node) {
				let component;
				let components_for_context = COMPONENTS_BY_NODE_CONTEXT_AND_TYPE.get(node.node_context());
				if (components_for_context) {
					component = components_for_context.get(node.type);
				}
				if (!component) {
					component = COMPONENTS_BY_NODE_CONTEXT.get(node.node_context());
				}
				return component;
			}
		});

		async function compute_node() {
			if (!node) {
				return;
			}
			// if (node.cook) {
			// gl nodes don't have that
			await node.request_container();
			// }

			time_dependent.value = node.states.time_dependent.active;
			error_message.value = node.states.error.message;

			const scene_predecessors = node.dependencies_controller.scene_predecessors();
			const scene_successors = node.dependencies_controller.scene_successors();
			node_by_path.clear();
			scene_predecessor_paths.value = get_full_or_direct_paths(scene_predecessors);
			scene_successor_paths.value = get_full_or_direct_paths(scene_successors);
		}
		function get_full_or_direct_paths(nodes: BaseNodeType[]): string[] {
			if (!props.graph_node_id) {
				return [];
			}
			const current_node = StoreController.engine.node(props.graph_node_id) as BaseNodeType;
			return nodes
				.map((node) => {
					const has_same_parent = node.parent?.graph_node_id == current_node.parent?.graph_node_id;
					const relative_path = './' + node.name;
					const absolute_path = node.full_path();
					const path = has_same_parent ? relative_path : absolute_path;

					node_by_path.set(path, node);
					return path;
				})
				.sort();
		}
		function go_to_node_path(node_path: string) {
			const node = node_by_path.get(node_path);
			if (node) {
				StoreController.editor.set_current_node(node);
			}
		}
		async function on_name_click() {
			const current_node = StoreController.engine.node(props.graph_node_id) as BaseNodeType;
			if (!current_node) {
				return;
			}
			const new_name: string = await StoreController.editor.dialog_prompt.show({
				title: 'Rename Node:',
				default_value: current_node.name,
				confirm_label: 'Update Name',
			});
			if (new_name != null && new_name.length > 0) {
				const cmd = new NodeSetNameCommand(current_node, new_name);
				cmd.push();
			}
		}

		return {
			node_name,
			time_dependent,
			error_message,
			scene_predecessor_paths,
			scene_successor_paths,
			node_by_path,
			time_dependency_label,
			time_dependency_class_object,
			current_node_info_type,

			// functions
			go_to_node_path,
			on_name_click,
		};
	},
});
</script>

<style lang="sass">

@import "globals.sass"

$color_node_info_bg: lighten($color_bg_panel_network, 20%)
$color_border: darken($color_bg_panel_network, 20%)

$color_node_title_bg: $color_border
$color_node_title_font: white
$color_time_dependent: darken($success-color, 25%)
$color_error_message: $alert-color
$color_separator: darken($color_node_info_bg, 20%)
$color_dependency_item_hover: darken($color_node_info_bg, 5%)

$size_border: 4px
$size_arrow: 10px
$padding: 20px

.NetworkNodeInfo
	position: absolute
	// width: 200px
	// height: 200px
	z-index: $z_index_node_info
	transform: translateY(-50%)
	margin-left: 35px

	background-color: $color_node_info_bg
	border: $size_border solid $color_border

	.arrow-left
		width: 0
		height: 0
		border-top: $size_arrow solid transparent
		border-bottom: $size_arrow solid transparent
		border-right: $size_arrow solid $color_border
		position: absolute
		top: 50%
		transform: translate(-100%, -50%)

	.node_title_container
		background-color: $color_node_title_bg
		color: $color_node_title_font
		text-align: center
		cursor: pointer


	.node_info_container
		padding: $padding

		.icon_prefixed
			svg
				margin-right: 10px
				position: relative
				top: 3px

		.time_dependency
			white-space: nowrap
			&.time_dependent
				color: $color_time_dependent

		.error_message
			color: $color_error_message

		.node_info_separator
			margin: 10px 0px
			height: 1px
			background-color: $color_separator

		.dependencies
			.dependencies_section
				margin-top: 10px
				.dependencies_section_title
					font-weight: bold
				.dependencies_list
					.dependendies_item
						cursor: pointer
						&:hover
							background-color: $color_dependency_item_hover
</style>
