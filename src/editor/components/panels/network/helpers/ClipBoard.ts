import {Vector2} from 'three/src/math/Vector2';
import lodash_max from 'lodash/max';
import lodash_map from 'lodash/map';
import lodash_min from 'lodash/min';
import lodash_includes from 'lodash/includes';
import lodash_filter from 'lodash/filter';

// import History from 'src/Editor/History/_Module';
import {NodesCodeExporter} from 'src/engine/io/code/export/Nodes';
import {CameraAnimationHelper} from './CameraAnimation';
import {Constants} from './Constants';

import {BaseNodeType} from 'src/engine/nodes/_Base';
import {NodeEvent} from 'src/engine/poly/NodeEvent';

export class ClipBoardHelper {
	_nodes_by_parent_node_type: Dictionary<BaseNodeType> = {};

	constructor() {}

	// caches.open('clipboard').then (cache) =>
	// 	@_cache = cache

	copy_from_node(parent_node: BaseNodeType, child_nodes: BaseNodeType[]) {
		//return if !@_cache?
		//@_nodes_by_parent_node_type[parent_node.type()] = child_nodes

		const code = this.create_code_for_nodes(parent_node, child_nodes);
		if (code && parent_node.children_controller) {
			this.write_cache(parent_node.children_controller.context, code);
		}
	}

	paste_in_node(parent_node: BaseNodeType, cam_animation_helper: CameraAnimationHelper) {
		//return if !@_cache?

		parent_node.scene.lifecycle_controller.on_create_prevent(() => {
			const camera_position = cam_animation_helper.position();

			if (parent_node.children_controller) {
				const code = this.read_cache(parent_node.children_controller.context);
				if (code) {
					const current_nodes = parent_node.children();

					// TODO: this prevents the UI from updating. Hold off until there is a queue
					//this.$store.scene.set_auto_update(false)

					//code = lodash_flatten(code_lines).join(";\n")
					const code_wrapped_timestamp = Math.floor(performance.now() * 10000);
					const code_wrapped_function_name = `paste_clipboard_${code_wrapped_timestamp}`;
					const code_wrapped = `const ${code_wrapped_function_name} = function(parent){ const context={}; ${code}}; ${code_wrapped_function_name}(parent_node.scene().node('${parent_node.full_path()}'))`;
					// console.log(code_wrapped)
					eval(code_wrapped);

					// select the newly created nodes
					const new_nodes = lodash_filter(
						parent_node.children(),
						(child) => !lodash_includes(current_nodes, child)
					);

					this.offset_nodes(new_nodes, camera_position.multiplyScalar(-1));
					new_nodes.forEach((node) => {
						node.emit(NodeEvent.PARAMS_UPDATED);
					});

					parent_node.children_controller.selection.set(new_nodes);
				}
			}
		});
	}

	offset_nodes(nodes: BaseNodeType[], camera_position: Vector2) {
		const positions = nodes.map((node) => node.ui_data.position);
		const min = new Vector2(lodash_min(lodash_map(positions, 'x')), lodash_min(lodash_map(positions, 'y')));
		const max = new Vector2(lodash_max(lodash_map(positions, 'x')), lodash_max(lodash_map(positions, 'y')));
		const center = min.add(max).multiplyScalar(0.5);
		const offset = camera_position.sub(center);

		const precision = 1 * Constants.NODE_UNIT;
		offset.x = precision * Math.round(offset.x / precision);
		offset.y = precision * Math.round(offset.y / precision);

		nodes.forEach((node) => {
			node.ui_data.translate(offset, true);
		});
	}
	//this.$store.scene.set_auto_update(true)

	// child_nodes = @_nodes[parent_node.type()]

	// command = new History.Command.Multiple()
	// move_offset = new Vector2(2, 0)

	// lodash_each child_nodes, (child_node)=>
	// 	cloned_child_node = child_node.clone()
	// 	command.push_command( new History.Command.NodeAdd(parent_node, cloned_child_node) )

	// 	command.push_command( new History.Command.NodeMove([cloned_child_node], move_offset) )

	// 	# TODO: only connect if the input is under the same parent?
	// 	# or also just connect to one that has the same name?
	// 	lodash_each child_node.inputs(), (input, index)=>
	// 		command.push_command( new History.Command.NodeConnect(input, cloned_child_node, index) )

	// command.push()

	private create_code_for_nodes(parent_node: BaseNodeType, nodes: BaseNodeType[]): string | undefined {
		const positions = lodash_map(nodes, (node) => node.ui_data.position);
		const positions_xs = lodash_map(positions, 'x');
		const min_x = lodash_min(positions_xs);
		const max_x = lodash_max(positions_xs);
		if (max_x != null && min_x != null) {
			const position_x_offset = max_x - min_x + 2;

			const parent_var_name = 'parent_node';
			const exporter = new NodesCodeExporter(nodes);
			const lines: string[] = exporter.process_with_existing_nodes(
				parent_node,
				parent_var_name,
				position_x_offset
			);
			return lines.join('\n');
		}
	}
	//code_lines = []
	//code_lines.push( parent_node.as_code_declare() )
	//lodash_each nodes, (node)->
	//	code_lines.push( node.as_code_create(parent_var_name) )
	//lodash_each nodes, (node)->
	//	code_lines.push( node.as_code_set_up({position_x_offset: position_x_offset}) )

	// code_lines = lodash_flatten(code_lines)
	// code_lines = lodash_map code_lines, (code_line, i)->
	// 	[
	// 		"console.log('#{i}')"
	// 		code_line
	// 	]
	// TODO: set display flag
	//code_lines.push( parent_node.as_code_set_up_custom() )

	//code = lodash_flatten(code_lines).join(";\n")

	private write_cache(cache_name: string, text: string) {
		//return if !@_cache?
		//@_nodes_by_parent_node_type[parent_node.type()] = child_nodes
		//@_cache.put( cache_name, new Response(text) )
		localStorage.setItem(cache_name, text);
	}

	private read_cache(cache_name: string): string | null {
		// @_cache.match(cache_name).then (response) =>
		// 	if response?
		// 		response.text().then (text)=>
		// 			callback(text)
		// 	else
		const code = localStorage.getItem(cache_name);
		if (code == null) {
			console.warn(`no cache available at ${cache_name}`);
		}
		return code;
	}
}
