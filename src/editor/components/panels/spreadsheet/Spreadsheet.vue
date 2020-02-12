
<template lang='pug'>

	include /mixins.pug

	doctype html

	.Panel.Spreadsheet.full_height_container.grid-y



		.cell.shrink
			span(v-if='loading')
				+spinner
				span loading...

		.cell.auto(
			v-if = '!loading'
			ref = 'table_container'
			)
			.full_height_container.grid-y
				.cell.shrink
					.grid-x
						.cell.shrink
							.spreadsheet-drop-down-container
								.spreadsheet-drop-down-label view attributes
								.spreadsheet-drop-down-content

									.spreadsheet-drop-down-entry(@click = 'select_all_attributes')
										span.attr-selection-icon
											+checked('true')
										span.attr-name select all
									.spreadsheet-drop-down-entry(@click = 'select_no_attributes')
										span.attr-selection-icon
											+checked('false')
										span.attr-name select none
									.spreadsheet-drop-down-separator

									.spreadsheet-drop-down-entry(
										v-for = 'attrib_name in attrib_names'
										@click = 'toggle_attrib_selection(attrib_name)'
										)
										span.attr-selection-icon
											+checked('attrib_selected_states[attrib_name]')
										span.attr-name {{attrib_name}}
						.cell.shrink
							.attrib-class-selectors
								.attrib-class-selector(
									@click = 'set_attrib_class_vertex(false)'
									title = 'objects'
									:class = '{active: (attrib_class_vertex==false)}'
									)
									v-icon(name = 'square')
								.attrib-class-selector(
									@click = 'set_attrib_class_vertex(true)'
									title = 'vertices'
									:class = '{active: (attrib_class_vertex==true)}'
									)
									v-icon(name = 'regular/circle')


				.cell.auto
					ag-grid-vue(
						class = "ag-theme-balham"
						:rowData = "table_data"
						:columnDefs = "columnDefs"
						:modules = 'modules'
						:defaultColDef = "defaultColDef"
						:columnTypes = 'columnTypes'
						:getRowClass = 'getRowClass'
					)
						//- :enableSorting = "true"
						//- :enableColResize = "true"
			




</template>

<script lang='ts'>
import Vue from 'vue';

// internal libs
import {CoreConstant} from 'src/core/geometry/Constant';
import {CoreGroup} from 'src/core/geometry/Group';

// components
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import {AgGridVue} from '@ag-grid-community/vue';
import {CoreGraphNode} from '../../../../core/graph/CoreGraphNode';
import {StoreController} from '../../../store/controllers/StoreController';
import {NodeContext} from '../../../../engine/poly/NodeContext';
import {BaseSopNodeType} from '../../../../engine/nodes/sop/_Base';
import {SetupSelectedNode} from '../../mixins/SelectedNode';

// not sure where to import ag-grid types from yet
// so mocking them for now
interface HeaderName {
	headerName: string;
	field?: string;
	pinned?: 'left';
	type?: 'indexColumn' | 'numericColumn' | '';
	children?: HeaderName[];
}

import {
	createComponent,
	ref,
	computed,
	onBeforeMount,
	SetupContext,
	onBeforeUnmount,
	onMounted,
	watch,
} from '@vue/composition-api';
export default createComponent({
	name: 'spreadsheet-panel',
	components: {AgGridVue},

	setup(props, context: SetupContext) {
		const loading = ref(true);
		const attrib_names = ref<string[]>([]);
		const attrib_class_vertex = ref(true);
		const attrib_selected_states_by_name = ref<Dictionary<boolean>>({});
		const header_names = ref<HeaderName[]>([]);
		const table_data = ref<Dictionary<number>[]>([]);
		modules: AllCommunityModules;

		// find first_selected_node
		const {first_selected_node_id, first_selected_node} = SetupSelectedNode();
		function first_selected_sop_node() {
			const node = first_selected_node();
			if (node && node.node_context() == NodeContext.SOP) {
				return node as BaseSopNodeType;
			}
			return null;
		}

		onBeforeMount(() => {
			context.emit('created');
		});

		const graph_node = new CoreGraphNode(StoreController.scene, 'Spreadsheet_Panel');
		graph_node.add_post_dirty_hook(() => {
			load_geometry();
		});
		onMounted(() => {
			connect_graph_node_if_node_is_sop();
		});
		function connect_graph_node_if_node_is_sop() {
			const first_selected_node = first_selected_sop_node();
			if (first_selected_node) {
				graph_node.add_graph_input(first_selected_node);
				load_geometry();
			}
		}
		onBeforeUnmount(() => {
			graph_node.graph_disconnect_predecessors();
		});

		// computed
		const class_object_object_button = computed(() => {
			return {active: attrib_class_vertex.value == false};
		});

		const defaultColDef = computed(() => {
			return {
				editable: true,
				width: 100,
				sortable: true,
				resizable: true,
			};
		});
		const columnTypes = computed(() => {
			return {
				indexColumn: {
					editable: false,
					width: 30,
				},
			};
		});

		const attrib_selected_states = computed(() => {
			const states: Dictionary<boolean> = {};

			for (let attrib_name of attrib_names.value) {
				states[attrib_name] = attrib_selected_states_by_name.value[attrib_name];
				if (states[attrib_name] == null) {
					states[attrib_name] = true;
				}
			}

			return states;
		});

		const columnDefs = computed(() => {
			return header_names.value.filter((header_name) => {
				const attrib_name = header_name.headerName;
				return attrib_name === '' || attrib_selected_states.value[attrib_name];
			});
		});

		// watch
		watch(first_selected_node_id, (new_id, old_id) => {
			graph_node.graph_disconnect_predecessors();
			connect_graph_node_if_node_is_sop();
		});

		watch(attrib_class_vertex, () => {
			load_geometry();
		});

		// functions
		// function from_json(json:object){}
		// function to_json(){return {}}
		function getRowClass(params: any) {
			if (params.node.rowIndex % 2 === 0) {
				return 'row-odd';
			}
		}

		function set_attrib_class_vertex(new_val: boolean) {
			attrib_class_vertex.value = new_val;
		}

		function toggle_attrib_selection(attrib_name: string) {
			if (attrib_selected_states_by_name.value[attrib_name] == null) {
				Vue.set(attrib_selected_states_by_name, attrib_name, false);
			} else {
				const inverted_selection = !attrib_selected_states_by_name.value[attrib_name];
				Vue.set(attrib_selected_states_by_name, attrib_name, inverted_selection);
			}
		}
		function select_all_attributes() {
			for (let attrib_name of attrib_names.value) {
				Vue.set(attrib_selected_states_by_name, attrib_name, true);
			}
		}
		function select_no_attributes() {
			for (let attrib_name of attrib_names.value) {
				Vue.set(attrib_selected_states_by_name, attrib_name, false);
			}
		}

		async function load_geometry() {
			const first_selected_node = first_selected_sop_node();
			if (first_selected_node) {
				loading.value = true;
				const container = await first_selected_node.request_container();
				if (container.core_content != null) {
					const core_group = container.core_content();

					if (core_group) {
						build(core_group);
					}

					// the add dependency is at the end for now, as when looking at a node like Point SOP
					// with expressions, it gets recooked every time the param position gets dirty,
					// and therefore for every point. I need a way to avoid that
					// graph_node.add_graph_input(first_selected_node);

					loading.value = false;
				}
			}
		}

		function build(core_group: CoreGroup) {
			if (attrib_class_vertex) {
				return build_for_points(core_group);
			} else {
				return build_for_objects();
			}
		}

		//
		//
		// OBJECTS
		//
		//
		function build_for_objects() {
			_build_headers_for_objects();
			_build_table_data_for_objects();
		}

		function _build_headers_for_objects() {
			//
			header_names.value = [];
		}

		function _build_table_data_for_objects() {
			//
			return table_data;
		}

		//
		//
		// POINTS
		//
		//
		function build_for_points(core_group: CoreGroup) {
			_build_headers_for_points(core_group);
			_build_table_data_for_points(core_group);
		}

		function _build_headers_for_points(core_group: CoreGroup) {
			// const points = core_group.points();
			attrib_names.value = core_group.attrib_names();
			const attrib_sizes = core_group.attrib_sizes();
			const position_name = 'position';

			// header
			header_names.value = [];
			header_names.value.push({
				headerName: '',
				field: 'index',
				pinned: 'left',
				type: 'indexColumn',
			});
			header_names.value.push({
				headerName: position_name,
				children: [
					{headerName: 'x', field: 'P_x', type: 'numericColumn'},
					{headerName: 'y', field: 'P_y', type: 'numericColumn'},
					{headerName: 'z', field: 'P_z', type: 'numericColumn'},
				],
			});
			// header_names.push({headerName: 'P[x]', field: 'P_x', type: 'numericColumn'})
			// header_names.push({headerName: 'P[y]', field: 'P_y', type: 'numericColumn'})
			// header_names.push({headerName: 'P[z]', field: 'P_z', type: 'numericColumn'})

			attrib_names.value.sort();
			for (let i = 0; i < attrib_names.value.length; i++) {
				const attrib_name = attrib_names.value[i];
				const attrib_type = core_group.attrib_type(attrib_name);
				const column_type = attrib_type === CoreConstant.ATTRIB_TYPE.NUMERIC ? 'numericColumn' : '';

				if (attrib_name !== position_name) {
					const attrib_size = attrib_sizes[attrib_name];
					switch (attrib_size) {
						case 1:
							header_names.value.push({
								headerName: attrib_name,
								field: `${attrib_name}_x`,
								type: column_type,
							});
							break;
						case 2:
							header_names.value.push({
								headerName: attrib_name,
								children: ['x', 'y'].map((c) => ({
									headerName: c,
									field: `${attrib_name}_${c}`,
									type: column_type,
								})),
							});
							break;
						case 3:
							header_names.value.push({
								headerName: attrib_name,
								children: ['x', 'y', 'z'].map((c) => ({
									headerName: c,
									field: `${attrib_name}_${c}`,
									type: column_type,
								})),
							});
							break;
						case 4:
							header_names.value.push({
								headerName: attrib_name,
								children: ['x', 'y', 'z', 'w'].map((c) => ({
									headerName: c,
									field: `${attrib_name}_${c}`,
									type: column_type,
								})),
							});
							break;
					}
				}
			}
		}

		function _build_table_data_for_points(core_group: CoreGroup) {
			const points = core_group.points();
			const geo_attrib_names = core_group.attrib_names();
			const attrib_sizes = core_group.attrib_sizes();
			const position_name = 'position';

			// table data
			table_data.value = points.map((point, i) => {
				const position = point.position();
				const point_attribute_values: Dictionary<number> = {
					index: i,
					P_x: position.x,
					P_y: position.y,
					P_z: position.z,
				};

				geo_attrib_names.forEach((attrib_name, i) => {
					if (attrib_name !== position_name) {
						const attrib_size = attrib_sizes[attrib_name];
						const value = point.attrib_value(attrib_name);
						switch (attrib_size) {
							case 1:
								point_attribute_values[`${attrib_name}_x`] = value;
								break;
							case 2:
								point_attribute_values[`${attrib_name}_x`] = value.x;
								point_attribute_values[`${attrib_name}_y`] = value.y;
								break;
							case 3:
								point_attribute_values[`${attrib_name}_x`] = value.x;
								point_attribute_values[`${attrib_name}_y`] = value.y;
								point_attribute_values[`${attrib_name}_z`] = value.z;
								break;

							case 4:
								point_attribute_values[`${attrib_name}_x`] = value.x;
								point_attribute_values[`${attrib_name}_y`] = value.y;
								point_attribute_values[`${attrib_name}_z`] = value.z;
								point_attribute_values[`${attrib_name}_w`] = value.w;
								break;
						}
					}
				});

				return point_attribute_values;
			});
		}

		return {
			modules: AllCommunityModules,
			loading,
			attrib_names,
			attrib_class_vertex,
			attrib_selected_states_by_name,
			header_names,
			table_data,
			//computed
			class_object_object_button,
			defaultColDef,
			columnTypes,
			attrib_selected_states,
			columnDefs,
			// functions
			getRowClass,
			set_attrib_class_vertex,
			toggle_attrib_selection,
			select_all_attributes,
			select_no_attributes,
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"
	
	.Panel.Spreadsheet

		.ag-theme-balham
			height: 100%

		$dropdown_entry_bg_color: $color_bg
		.spreadsheet-drop-down-container
			position: relative
			cursor: pointer
			display: inline-block
			
			// margin: 2px
			&:hover
				.spreadsheet-drop-down-label
					color: $dropdown_entry_bg_color
					background-color: $color_font
				.spreadsheet-drop-down-content
					display: block
			.spreadsheet-drop-down-label
				padding: 2px 5px
				margin: 2px
				display: inline-block
				background-color: darken($dropdown_entry_bg_color, 5%)
				border: 1px solid mix($color_bg, $color_font, 50%)
				border-radius: 3px

			.spreadsheet-drop-down-content
				display: none
				z-index: 100
				position: absolute
				top: 100%
				left: 10px
				width: auto
				background-color: $dropdown_entry_bg_color
				border: 1px solid mix($color_bg, $color_font, 50%)

				.spreadsheet-drop-down-separator
					padding: 10px 0px
				.spreadsheet-drop-down-entry
					min-width: 100px
					padding: 2px 5px
					&:hover
						background-color: darken($dropdown_entry_bg_color, 5%)

					.attr-selection-icon
						display: inline-block
						// padding: 2px 5px
						position: relative
						top: 3px
					.attr-name
						display: inline-block
						margin-left: 5px


		.attrib-class-selectors
			margin-left: 20px
			.attrib-class-selector
				display: inline-block
				margin-left: 2px
				border: 1px solid $color_font
				border-radius: 5px
				padding: 2px 10px
				cursor: pointer
				&:hover
					background-color: darken($color_bg, 10%)
				&.active
					background-color: darken($primary-color, 2%)
					color: $color_bg
				svg
					position: relative
					top: 2px

		.row-odd
			background-color: darken(white, 10%)

</style>
