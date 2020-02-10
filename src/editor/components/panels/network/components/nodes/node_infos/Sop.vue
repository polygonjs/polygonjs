<template lang='pug'>

	include /mixins.pug

	doctype html

	.NetworkNodeInfoSop(
		)

		.node_info_sop_section.inline.objects_count
			.node_info_sop_section_title objects count:
			.node_info_sop_section_content
				span {{objects_count}}
				span.objects_count_visible(
					:class = 'objects_count_visible_class_object'
					) (visible: {{objects_visible_count}})

		.node_info_sop_section.inline.objects_types(v-for = 'object_type in object_types')
			.node_info_sop_section_title {{object_type}}:
			.node_info_sop_section_content
				span {{objects_count_by_type[object_type]}}

		.node_info_sop_section.inline.points_count
			.node_info_sop_section_title points count:
			.node_info_sop_section_content {{points_count}}

		.node_info_separator

		//- .node_info_sop_section.inline.object_names.grid-x.grid-padding-x
		//- 	.cell.shrink.node_info_sop_section_title Object Names:
		//- 	.cell.auto.node_info_sop_section_content(
		//- 		@wheel.stop = ''
		//- 		)
		//- 		ul.no-bullet
		//- 			li(v-for = 'object_name in objects_names') {{object_name}}

		.node_info_separator

		.node_info_sop_section.attributes.block
			strong.node_info_sop_section_title vertex attributes:
			.node_info_sop_section_content.attribute_info(
				v-for = 'name in vertex_attribute_names'
				:class = 'vertex_class_objects_by_name[name]'
				) {{name}} ({{vertex_human_labels_by_name[name]}})

		.bbox_infos
			table
				tr(v-for = 'prop_name in table_prop_names')
					td {{prop_name}}
					td.number(v-for = 'j in [0,1,2]') {{table_props[prop_name][j]}}



</template>

<script lang='ts'>
// import {Object3D} from 'three/src/core/Object3D';

// third party lib
// import lodash_flatten from 'lodash/flatten';
// import lodash_uniq from 'lodash/uniq';
// import PrintTree from 'print-tree'

import {CoreConstant} from 'src/core/geometry/Constant';
import {BaseSopNodeType} from 'src/engine/nodes/sop/_Base';
import {StoreController} from '../../../../../../store/controllers/StoreController';
import {CoreGroup} from '../../../../../../../core/geometry/Group';

import {createComponent, ref, onMounted, computed} from '@vue/composition-api';
export default createComponent({
	name: 'network_node_info_sop',
	props: {
		graph_node_id: null,
	},

	setup(props) {
		const node = StoreController.engine.node(props.graph_node_id)! as BaseSopNodeType;

		const objects_count = ref(0);
		const objects_visible_count = ref(0);
		const objects_count_by_type = ref<Dictionary<number>>({});
		const objects_names_by_type = ref<Dictionary<string[]>>({});
		// const objects_names = ref<string[]>([]);
		const vertex_attribute_sizes_by_name = ref<Dictionary<number>>({});
		const vertex_attribute_types_by_name = ref<Dictionary<number>>({});
		const points_count = ref(0);
		const center = ref<Number3>([0, 0, 0]);
		const size = ref<Number3>([0, 0, 0]);
		const min = ref<Number3>([0, 0, 0]);
		const max = ref<Number3>([0, 0, 0]);

		const table_props = computed(() => {
			return {
				center: center.value,
				size: size.value,
				min: min.value,
				max: max.value,
			};
		});
		const table_prop_names = computed(() => {
			return ['center', 'size', 'min', 'max'];
		});
		const objects_count_visible_class_object = computed(() => {
			return {
				highlighted: objects_count.value != objects_visible_count.value,
			};
		});
		const object_types = computed(() => {
			return Object.keys(objects_count_by_type.value).sort();
		});
		const vertex_attribute_names = computed(() => {
			return Object.keys(vertex_attribute_sizes_by_name.value).sort();
		});
		const vertex_class_objects_by_name = computed(() => {
			const h: Dictionary<Dictionary<boolean>> = {};
			for (let name of Object.keys(vertex_attribute_sizes_by_name.value)) {
				const type = vertex_attribute_types_by_name.value[name];
				const is_string = type == CoreConstant.ATTRIB_TYPE.STRING;
				let class_name = is_string ? 'string' : 'numeric';
				const class_object: Dictionary<boolean> = {};
				class_object[class_name] = true;
				h[name] = class_object;
			}
			return h;
		});
		const vertex_human_labels_by_name = computed(() => {
			const h: Dictionary<string> = {};
			for (let name of Object.keys(vertex_attribute_sizes_by_name)) {
				const type = vertex_attribute_types_by_name.value[name];
				const is_string = type == CoreConstant.ATTRIB_TYPE.STRING;
				let label = is_string ? 'string' : `${vertex_attribute_sizes_by_name.value[name]}f`;
				h[name] = label;
			}

			return h;
		});

		onMounted(() => {
			compute_node();
		});

		async function compute_node() {
			const container = await node.request_container();

			const core_group = container.core_content(); //.group({clone: false})
			if (!core_group) {
				return;
			}
			_print_tree(core_group);

			console.log(core_group.objects());

			objects_count.value = container.objects_count();
			objects_visible_count.value = container.objects_visible_count();
			objects_count_by_type.value = container.objects_count_by_type();
			objects_names_by_type.value = container.objects_names_by_type();
			// const object_names: string[] = [];
			// for (let type of Object.keys(objects_names_by_type.value)) {
			// 	object_names.value.push(objects_names_by_type.value[type]);
			// }
			// Vue.set(this, 'objects_names', lodash_uniq(lodash_flatten(object_names)));

			points_count.value = container.points_count();

			vertex_attribute_sizes_by_name.value = container.vertex_attribute_sizes_by_name();
			vertex_attribute_types_by_name.value = container.vertex_attribute_types_by_name();

			center.value = container.center().toArray() as Number3;
			size.value = container.size().toArray() as Number3;
			const bbox = container.bounding_box();
			min.value = bbox.min.toArray() as Number3;
			max.value = bbox.max.toArray() as Number3;
		}

		function _print_tree(group: CoreGroup) {
			// const get_human_type = (node: Object3D) => {
			// 	const human_type = CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[node.constructor.name];
			// 	if (human_type == null) {
			// 		console.warn('no known constructor name is CoreConstant');
			// 		console.warn(node.constructor.name);
			// 	}
			// 	const elements = [];
			// 	elements.push(human_type);
			// 	elements.push(node.name);
			// 	// const has_animation = node.animations != null;
			// 	// if (has_animation) {
			// 	// 	elements.push('has animation');
			// 	// }
			// 	return elements.join(' - ');
			// };
			// const get_children = (node: any) => {
			// 	return node.children;
			// };
			// group.objects().forEach((child) => {
			// 	PrintTree(child, get_human_type, get_children);
			// });
		}

		return {
			table_props,
			table_prop_names,
			objects_count_visible_class_object,
			object_types,
			vertex_attribute_names,
			vertex_class_objects_by_name,
			vertex_human_labels_by_name,
		};
	},
});
</script>

<style lang='sass'>

	@import "globals.sass"

	$color_table_border: black

	.NetworkNodeInfoSop

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

		.node_info_sop_section
			white-space: nowrap
			&.inline
				.node_info_sop_section_title
					display: inline-block
					margin-right: 5px
				.node_info_sop_section_content
					display: inline-block

			&.object_names
				.node_info_sop_section_title
					position: relative
					top: 0px
				.node_info_sop_section_content
					max-height: 200px
					overflow-y: scroll

		.objects_count_visible
			margin-left: 10px
			opacity: 0.7
			&.highlighted
				opacity: 1
				font-weight: bold

		.attribute_info
			&.string
				color: $primary_color
			&.numeric
				// color: darken($success_color, 20%)

</style>
