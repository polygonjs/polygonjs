import lodash_flatten from 'lodash/flatten';
import lodash_uniq from 'lodash/uniq';
import lodash_sortBy from 'lodash/sortBy';
import {TextureAllocation, TextureAllocationData} from './TextureAllocation';
import {BaseGlNodeType} from '../../_Base';

// import {TypedConnection, COMPONENTS_COUNT_BY_TYPE} from '../../../../../Engine/Node/Gl/GlData';
import {TextureVariable} from './TextureVariable';
import {ShaderConfig} from '../configs/ShaderConfig';
import {ShaderName, ParticleShaderNames} from '../../../utils/shaders/ShaderName';
import {PolyScene} from '../../../../scene/PolyScene';
import {GlConnectionPointComponentsCountMap, BaseGlConnectionPoint} from '../../../utils/io/connections/Gl';
import {AttributeGlNode} from '../../Attribute';
import {GlobalsGlNode} from '../../Globals';
import {OutputGlNode} from '../../Output';

export type TextureAllocationsControllerData = Dictionary<TextureAllocationData>[];
const OUTPUT_NAME_ATTRIBUTES = ['position', 'normal', 'color', 'uv'];

export class TextureAllocationsController {
	private _allocations: TextureAllocation[] = [];
	private _next_allocation_index: number = 0;

	constructor() {}
	allocate_connections_from_root_nodes(root_nodes: BaseGlNodeType[], leaf_nodes: BaseGlNodeType[]) {
		const variables = [];

		// TODO: let's go through the output node first, in case there is a name conflict, it will have priority
		for (let node of root_nodes) {
			const node_id = node.graph_node_id;
			switch (node.type) {
				case OutputGlNode.type(): {
					for (let connection_point of node.io.inputs.named_input_connection_points) {
						const input = node.io.inputs.named_input(connection_point.name);
						if (input) {
							// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
							// connections_by_node_id[node_id].push(named_input)
							const variable = new TextureVariable(
								connection_point.name,
								GlConnectionPointComponentsCountMap[connection_point.type]
							);
							variable.add_graph_node_id(node_id);
							variables.push(variable);
						}
					}
					break;
				}
				case AttributeGlNode.type(): {
					const attrib_node = node as AttributeGlNode;
					const named_input: BaseGlNodeType | null = attrib_node.connected_input_node();
					const connection_point:
						| BaseGlConnectionPoint
						| undefined = attrib_node.connected_input_connection_point();
					if (named_input && connection_point) {
						// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
						// connections_by_node_id[node_id].push(named_input)
						const variable = new TextureVariable(
							attrib_node.attribute_name,
							GlConnectionPointComponentsCountMap[connection_point.type]
						);
						variable.add_graph_node_id(node_id);
						variables.push(variable);
					}
					break;
				}
			}
		}
		for (let node of leaf_nodes) {
			const node_id = node.graph_node_id;
			switch (node.type) {
				case GlobalsGlNode.type(): {
					const globals_node = node as GlobalsGlNode;
					// const output_names_not_attributes = ['frame', 'gl_FragCoord', 'gl_PointCoord'];
					for (let output_name of globals_node.io.outputs.used_output_names()) {
						// const is_attribute = !lodash_includes(output_names_not_attributes, output_name)

						// is_attribute, as opposed to frame, gl_FragCoord and gl_PointCoord which are either uniforms or provided by the renderer
						const is_attribute = OUTPUT_NAME_ATTRIBUTES.includes(output_name);

						if (is_attribute) {
							const connection_point = globals_node.io.outputs.named_output_connection_points_by_name(
								output_name
							);
							if (connection_point) {
								const gl_type = connection_point.type;
								const variable = new TextureVariable(
									output_name,
									GlConnectionPointComponentsCountMap[gl_type]
								);
								variable.add_graph_node_id(node_id);
								variables.push(variable);
							}
						}
					}
					break;
				}
				case AttributeGlNode.type(): {
					const attribute_node = node as AttributeGlNode;
					const connection_point = attribute_node.output_connection_point();
					if (connection_point) {
						// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
						// connections_by_node_id[node_id].push(named_output)
						const variable = new TextureVariable(
							attribute_node.attribute_name,
							GlConnectionPointComponentsCountMap[connection_point.type]
						);
						variable.add_graph_node_id(node_id);
						variables.push(variable);
					}
					break;
				}
			}
		}

		this.allocate_variables(variables);
	}
	private allocate_variables(variables: TextureVariable[]) {
		const variables_by_size_inverse = lodash_sortBy(variables, (variable) => {
			return -variable.size;
		});
		for (let variable of variables_by_size_inverse) {
			this.allocate_variable(variable);
		}
	}
	private allocate_variable(new_variable: TextureVariable) {
		let allocated = this.has_variable(new_variable.name);
		if (allocated) {
			const allocated_variable = this.variables().filter((v) => v.name == new_variable.name)[0];
			new_variable.graph_node_ids?.forEach((boolean, graph_node_id) => {
				allocated_variable.add_graph_node_id(graph_node_id);
			});
		} else {
			if (!allocated) {
				for (let allocation of this._allocations) {
					if (!allocated && allocation.has_space_for_variable(new_variable)) {
						allocation.add_variable(new_variable);
						allocated = true;
					}
				}
			}
			if (!allocated) {
				const new_allocation = new TextureAllocation(this.next_allocation_name());
				this._allocations.push(new_allocation);
				new_allocation.add_variable(new_variable);
			}
		}
	}
	private add_allocation(allocation: TextureAllocation) {
		this._allocations.push(allocation);
	}

	next_allocation_name(): ShaderName {
		const name = ParticleShaderNames[this._next_allocation_index];
		this._next_allocation_index += 1;
		return name;
	}

	shader_names(): ShaderName[] {
		const explicit_shader_names = this._allocations.map((a) => a.shader_name);

		// include dependencies if needed
		// TODO: typescript - do I need those?
		// if (lodash_includes(explicit_shader_names, 'acceleration')) {
		// 	explicit_shader_names.push('velocity');
		// }
		// if (lodash_includes(explicit_shader_names, 'velocity')) {
		// 	explicit_shader_names.push('position');
		// }

		return lodash_uniq(explicit_shader_names);
	}
	create_shader_configs(): ShaderConfig[] {
		return [
			// new ShaderConfig('position', ['position'], []),
			// new ShaderConfig('fragment', ['color', 'alpha'], ['vertex']),
		];
	}
	allocation_for_shader_name(shader_name: ShaderName): TextureAllocation {
		return this._allocations.filter((a) => a.shader_name == shader_name)[0];
	}
	input_names_for_shader_name(root_node: BaseGlNodeType, shader_name: ShaderName) {
		const allocation = this.allocation_for_shader_name(shader_name);
		if (allocation) {
			return allocation.input_names_for_node(root_node);
		}
	}
	// find_variable(root_node: BaseNodeGl, shader_name: ShaderName, input_name: string): TextureVariable{
	// 	const allocation = this.allocation_for_shader_name(shader_name)
	// 	if(allocation){
	// 		return allocation.find_variable_with_node(root_node, input_name)
	// 	}
	// }
	variable(variable_name: string): TextureVariable | undefined {
		for (let allocation of this._allocations) {
			const variable = allocation.variable(variable_name);
			if (variable) {
				return variable;
			}
		}
	}
	variables(): TextureVariable[] {
		return lodash_flatten(this._allocations.map((a) => a.variables || []));
	}
	has_variable(name: string): boolean {
		const names = this.variables().map((v) => v.name);
		return names.includes(name);
	}
	// allocation_for_variable(name:string):TextureAllocation{
	// 	for(let allocation of this._allocations){
	// 		const variables = allocation.variables()
	// 		for(let variable of variables){
	// 			if(variable.name() == name){
	// 				return allocation
	// 			}
	// 		}
	// 	}
	// }
	static from_json(data: TextureAllocationsControllerData): TextureAllocationsController {
		const controller = new TextureAllocationsController();
		for (let datum of data) {
			const shader_name = Object.keys(datum)[0] as ShaderName;
			const allocation_data = datum[shader_name];
			const new_allocation = TextureAllocation.from_json(allocation_data, shader_name);
			controller.add_allocation(new_allocation);
		}
		return controller;
	}
	to_json(scene: PolyScene): TextureAllocationsControllerData {
		return this._allocations.map((allocation: TextureAllocation) => {
			const data = {
				[allocation.shader_name]: allocation.to_json(scene),
			};
			return data;
		});
	}
	print(scene: PolyScene) {
		console.log(JSON.stringify(this.to_json(scene), [''], 2));
	}
}
