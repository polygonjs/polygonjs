import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {NodesCodeExporter} from 'src/engine/io/code/export/Nodes';
import lodash_values from 'lodash/values';

// TODO:
// when I delete a node plugged on the second input (of a copy SOP for instance)
// the re-created connections are messed up

const TMP_PARENT = 'tmp_parent';

export class NodeDeleteCommand extends BaseCommand {
	private _undo_code_lines: string[] = [];
	private _required_nodes_code_by_name: Dictionary<string> = {};
	private _required_outputs_code_by_name: Map<string, Map<number, string>> = new Map();
	// private _old_selected_nodes: BaseNode[]
	// private _old_display_node_name: string | undefined;

	constructor(private _parent: BaseNodeType, private _nodes: BaseNodeType[]) {
		super();
		this.prepare();
	}

	prepare() {
		const exporter = new NodesCodeExporter(this._nodes);
		this._undo_code_lines = exporter.process(TMP_PARENT);

		const required_nodes_by_name: Dictionary<BaseNodeType> = {};
		this._nodes.forEach((node) => {
			node.io.inputs.inputs().forEach((input) => {
				if (input) {
					const name = input.name;
					required_nodes_by_name[name] = input;
				}
			});
			node.io.connections.output_connections().forEach((output_connection) => {
				if (output_connection) {
					const output_node = output_connection.node_dest;
					const name = output_node.name;
					required_nodes_by_name[name] = output_node;
					const input_index = output_connection.input_index;
					const output_index = output_connection.output_index;

					if (!this._required_outputs_code_by_name.get(name)) {
						this._required_outputs_code_by_name.set(name, new Map());
					}
					const line = `${name}.set_input(${input_index}, ${node.name}, ${output_index})`;
					this._required_outputs_code_by_name.get(name)!.set(input_index, line);
				}
			});
		});

		lodash_values(required_nodes_by_name).forEach((node) => {
			const name = node.name;
			this._required_nodes_code_by_name[name] = `const ${name} = ${TMP_PARENT}.node('${name}')`;
		});

		// this._old_selected_nodes = [];
	}

	do() {
		this._nodes.forEach((node) => {
			this._remove_node(node);
		});

		this._change_display_flag();
	}

	undo() {
		this._parent.scene.lifecycle_controller.on_create_prevent(() => {
			const start_lines: string[] = lodash_values(this._required_nodes_code_by_name);
			const end_lines: string[] = [];
			this._required_outputs_code_by_name.forEach((map, name) => {
				map.forEach((line, index) => {
					end_lines.push(line);
				});
			});
			lodash_values(this._required_outputs_code_by_name).map((o) => lodash_values(o));
			const empty_string_array: string[] = [];
			const all_code_lines: string[] = empty_string_array.concat(start_lines, this._undo_code_lines, end_lines);
			const code = all_code_lines.join('\n');
			const create_node_function = new Function(TMP_PARENT, code);
			create_node_function(this._parent);
			// this.nodes.forEach((node)=>{
			// 	this.parent.add_node(node);
			// });

			this._revert_display_flag();
			// this._revert_inputs();
			// this._revert_selection();
		});
	}

	// update selection (just remove from it)
	// update display flag (take any other node for now)
	// update inputs/outputs (how does a node know its output?? via the graph!)
	// set old dependencies dirty? (set_input takes care of it, but not expressions which cannot evaluate anymore)
	private _remove_node(node: BaseNodeType) {
		// this._remove_node_from_selection(node);
		// this._remove_inputs(node);

		this._parent.remove_node(node);
	}

	private _change_display_flag() {
		// TODO: typescript check this
		// const display_node = this._parent.display_node();
		// if (display_node) {
		// 	if (lodash_includes(this._nodes, display_node)) {
		// 		this._old_display_node_name = display_node.name();
		// 		this._parent.set_display_node(this._parent.children()[0]);
		// 	}
		// }
	}
	private _revert_display_flag() {
		// TODO: typescript check this
		// if (this._old_display_node_name) {
		// 	const old_display_node = this._parent.node(this._old_display_node_name);
		// 	this._parent.set_display_node(old_display_node);
		// }
	}

	// private _remove_inputs(node){
	// 	const output_nodes = node.outputs();

	// 	const input = node.input(0);
	// 	console.log(output_nodes)
	// 	output_nodes.forEach((output_node)=> {

	// 		output_node.inputs().forEach((input_node, i)=>{
	// 			if(input_node && input_node.graph_node_id() == node.graph_node_id()){
	// 				// this._old_inputs[output.graph_node_id()] = output.input(0);
	// 				output_node.set_input(i, null)
	// 				console.log(`removed ${i} from ${output_node.name()}`)
	// 			}
	// 		})
	// 		output_node.set_input(0, input);
	// 		console.log(`set ${input.name()} to ${output_node.name()}`)
	// 	});
	// 	console.log("remove inputs done")
	// }
	// private _revert_inputs() {
	// 	Object.keys(this._old_inputs).forEach((id)=> {
	// 		const node = this._scene.graph().node_from_id(id);
	// 		// const input = this._old_inputs[id];
	// 		node.set_input(0, input);
	// 	});
	// }

	// private _remove_node_from_selection(node: BaseNode){
	// 	if (this.parent.selection().contains(node)) {
	// 		// this._old_selected_nodes.push(node);
	// 		this.parent.selection().remove(node);
	// 	}
	// }

	// private _revert_selection() {
	// 	this._old_selected_nodes.forEach((node)=> {
	// 		this.parent.selection().add(node);
	// 	});
	// }
}
