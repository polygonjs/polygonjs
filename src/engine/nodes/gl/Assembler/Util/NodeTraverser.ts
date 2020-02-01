import lodash_compact from 'lodash/compact';
import lodash_uniq from 'lodash/uniq';
import {BaseNodeGl} from '../../_Base';
import {Output} from '../../Output';
import {CoreGraph} from 'src/core/graph/CoreGraph';
import {BaseNodeType} from '../../../_Base';
import {BaseShaderAssembler} from '../_Base';

type NumberByString = Map<string, number>;
type BooleanByString = Map<string, boolean>;
type BooleanByStringByString = Map<string, BooleanByString>;
type StringArrayByString = Map<string, string[]>;

// interface BaseNodeGlArrayByString {
// 	[propName: string]: BaseNodeGl[]
// }
// interface StringArrayByString {
// 	[propName: string]: string[]
// }

// import {LineType, LINE_TYPES} from './CodeBuilder'

// const VERTEX_INPUT_NAMES = [
// 	'position',
// 	'normal',
// 	'gl_PointSize'
// ]
// const FRAGMENT_INPUT_NAMES = [
// 	'color',
// 	'alpha'
// ]

export class NodeTraverser {
	private _leaves_graph_id: BooleanByStringByString = new Map();
	private _graph_ids_by_shader_name: BooleanByStringByString = new Map();
	private _outputs_by_graph_id: StringArrayByString = new Map();
	private _depth_by_graph_id: NumberByString = new Map();
	private _graph_id_by_depth: Map<number, string[]> = new Map();
	private _graph: CoreGraph;
	private _shader_name!: string;

	constructor(private _assembler: BaseShaderAssembler, private _gl_parent_node: BaseNodeType) {
		this._graph = this._gl_parent_node.scene.graph;
	}

	private reset() {
		this._leaves_graph_id.clear();
		this._outputs_by_graph_id.clear();
		this._depth_by_graph_id.clear();
		this._graph_id_by_depth.clear();

		this.shader_names().forEach((shader_name) => {
			this._graph_ids_by_shader_name.set(shader_name, new Map());
		});
	}

	shader_names() {
		return this._assembler.shader_names();
	}
	input_names_for_shader_name(root_node: BaseNodeGl, shader_name: string) {
		return this._assembler.input_names_for_shader_name(root_node, shader_name);
	}

	traverse(root_nodes: BaseNodeGl[]) {
		this.reset();

		for (let shader_name of this.shader_names()) {
			this._leaves_graph_id.set(shader_name, new Map());
		}

		for (let shader_name of this.shader_names()) {
			this._shader_name = shader_name;
			for (let root_node of root_nodes) {
				this.find_leaves_from_root_node(root_node);
				this.set_nodes_depth();
			}
		}

		const graph_ids = Object.keys(this._depth_by_graph_id);
		graph_ids.forEach((graph_id) => {
			const depth = this._depth_by_graph_id.get(graph_id);
			if (depth) {
				this._graph_id_by_depth.set(depth, this._graph_id_by_depth.get(depth) || []);
				this._graph_id_by_depth.get(depth)?.push(graph_id);
			}
		});
	}

	leaves_from_nodes(nodes: BaseNodeGl[]) {
		this._shader_name = 'leaves_from_nodes_shader';
		this._graph_ids_by_shader_name.set(this._shader_name, new Map());
		this._leaves_graph_id.set(this._shader_name, new Map());
		for (let node of nodes) {
			this.find_leaves(node);
		}

		const node_ids: string[] = [];
		this._leaves_graph_id.get(this._shader_name)?.forEach((value: boolean, key: string) => {
			node_ids.push(key);
		});
		return this._graph.nodes_from_ids(node_ids);
	}

	nodes_for_shader_name(shader_name: string) {
		const depths: number[] = [];
		this._graph_id_by_depth.forEach((value: string[], key: number) => {
			depths.push(key);
		});
		depths.sort();
		console.log('sorted depth:', depths);
		const nodes: BaseGlNodeType[] = [];
		depths.forEach((depth) => {
			const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
			if (graph_ids_for_depth) {
				graph_ids_for_depth.forEach((graph_id: string) => {
					const is_present = this._graph_ids_by_shader_name.get(shader_name)?.get(graph_id);
					if (is_present) {
						const node = this._graph.node_from_id(graph_id);
						if (node instanceof BaseNodeType) {
							nodes.push(node);
						}
					}
				});
			}
		});

		return nodes;
	}
	sorted_nodes() {
		const depths: number[] = [];
		this._graph_id_by_depth.forEach((value: string[], key: number) => {
			depths.push(key);
		});
		depths.sort();
		const nodes: BaseNodeType[] = [];
		depths.forEach((depth) => {
			const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
			if (graph_ids_for_depth) {
				graph_ids_for_depth.forEach((graph_id) => {
					const node = this._graph.node_from_id(graph_id);
					if (node) {
						nodes.push();
					}
				});
			}
		});

		return nodes;
	}
	find_leaves_from_root_node(root_node: BaseNodeGl) {
		// if(this._shader_name == ShaderName.VERTEX){
		// this._leaves_graph_id[this._shader_name] = {}
		const input_names = this.input_names_for_shader_name(root_node, this._shader_name);
		if (input_names) {
			for (let input_name of input_names) {
				if (root_node.type == 'output') {
					const input = root_node.io.inputs.named_input(input_name);
					if (input) {
						this.find_leaves(input);
					}
				} else {
					// if attribute
					const input = root_node.io.inputs.connected_named_input();
					if (input) {
						this.find_leaves(input);
					}
				}
			}
		}
		// const position_input = this._output.named_input('position')
		// const normal_input = this._output.named_input('normal')
		// const instancePosition_input = this._output.named_input('instancePosition')
		// if(position_input){ this.find_leaves(position_input) }
		// if(normal_input){ this.find_leaves(normal_input) }
		// if(instancePosition_input){ this.find_leaves(instancePosition_input) }
		// }
		// if(this._shader_name == ShaderName.FRAGMENT){
		// 	this._leaves_graph_id[this._shader_name] = {}
		// 	FRAGMENT_INPUT_NAMES.forEach(name=>{
		// 		const input = this._output.named_input(name)
		// 		if(input){
		// 			this.find_leaves(input)
		// 		}
		// 	})
		// 	// const color_input = this._output.named_input('color')
		// 	// const alpha_input = this._output.named_input('alpha')
		// 	// if(color_input){ this.find_leaves(color_input) }
		// 	// if(alpha_input){ this.find_leaves(alpha_input) }
		// }

		this._outputs_by_graph_id.forEach((outputs: string[], graph_id: string) => {
			this._outputs_by_graph_id.set(graph_id, lodash_uniq(outputs));
		});
		// console.log("this._outputs_by_graph_id", this._outputs_by_graph_id)

		// console.log(this._leaves_graph_id)
	}

	find_leaves(node: BaseNodeGl) {
		this._graph_ids_by_shader_name.get(this._shader_name)?.set(node.graph_node_id, true);

		const inputs = lodash_compact(node.inputs());
		const input_graph_ids = lodash_uniq(inputs.map((n) => n.graph_node_id()));
		const unique_inputs = input_graph_ids.map((graph_id) => this._graph.node_from_id(graph_id));
		// console.log(node.name(), unique_inputs.map(n=>n.name()).join(','))
		const graph_id = node.graph_node_id();
		if (unique_inputs.length > 0) {
			// const promises = unique_inputs.forEach((input)=>{
			for (let input of unique_inputs) {
				const key = input.graph_node_id();
				this._outputs_by_graph_id[key] = this._outputs_by_graph_id[key] || [];
				this._outputs_by_graph_id[key].push(graph_id);

				this.find_leaves(input);
			}
		} else {
			this._leaves_graph_id[this._shader_name][node.graph_node_id()] = true;
		}
	}

	set_nodes_depth() {
		const leave_ids = Object.keys(this._leaves_graph_id[this._shader_name]);
		leave_ids.forEach((graph_id) => {
			this.set_node_depth(graph_id);
		});
	}

	set_node_depth(graph_id: string, depth: number = 0) {
		const current_depth = this._depth_by_graph_id[graph_id];
		if (current_depth) {
			this._depth_by_graph_id[graph_id] = Math.max(current_depth, depth);
		} else {
			this._depth_by_graph_id[graph_id] = depth;
		}

		const node = this._graph.node_from_id(graph_id);
		// console.log("set depth", node.name(), depth)

		const output_ids = this._outputs_by_graph_id[graph_id];
		if (output_ids) {
			output_ids.forEach((output_id) => {
				this.set_node_depth(output_id, depth + 1);
			});
		}
	}
}
