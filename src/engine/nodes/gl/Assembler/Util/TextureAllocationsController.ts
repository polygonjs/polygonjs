import lodash_flatten from 'lodash/flatten';
import lodash_uniq from 'lodash/uniq';
import lodash_sortBy from 'lodash/sortBy';
import lodash_includes from 'lodash/includes';
import {TextureAllocation} from './TextureAllocation';
import {BaseGlNodeType} from 'src/engine/nodes/gl/_Base';

// import {TypedConnection, COMPONENTS_COUNT_BY_TYPE} from 'src/Engine/Node/Gl/GlData';
import {TextureVariable, TextureVariableData} from './TextureVariable';
import {ShaderConfig} from '../Config/ShaderConfig';
import {ShaderName, ParticleShaderNames} from 'src/engine/nodes/utils/shaders/ShaderName';
import {PolyScene} from 'src/engine/scene/PolyScene';
import {ConnectionPointComponentsCountMap} from 'src/engine/nodes/utils/connections/ConnectionPointType';
import {AttributeGlNode} from '../../Attribute';
import {BaseNamedConnectionPointType} from 'src/engine/nodes/utils/connections/NamedConnectionPoint';
import {GlobalsGlNode} from '../../Globals';

export type TextureAllocationsControllerData = Dictionary<TextureVariableData[] | undefined>[];

export class TextureAllocationsController {
	private _allocations: TextureAllocation[] = [];
	private _next_allocation_index: number = 0;

	constructor() {}
	allocate_connections_from_root_nodes(root_nodes: BaseGlNodeType[], leaf_nodes: BaseGlNodeType[]) {
		// const connections_by_node_id = {}
		const variables = [];

		// TODO: let's go through the output node first, in case there is a name conflict, it will have priority
		for (let node of root_nodes) {
			const node_id = node.graph_node_id;
			switch (node.type) {
				case 'output': {
					for (let connection_point of node.io.inputs.named_input_connection_points) {
						const input = node.io.inputs.named_input(connection_point.name);
						if (input) {
							// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
							// connections_by_node_id[node_id].push(named_input)
							const variable = new TextureVariable(
								connection_point.name,
								ConnectionPointComponentsCountMap[connection_point.type]
							);
							variable.add_graph_node_id(node_id);
							variables.push(variable);
						}
					}
					break;
				}
				case 'attribute': {
					const attrib_node = node as AttributeGlNode;
					const named_input: BaseGlNodeType | null = attrib_node.connected_input_node();
					const connection_point:
						| BaseNamedConnectionPointType
						| undefined = attrib_node.connected_input_connection_point();
					if (named_input && connection_point) {
						// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
						// connections_by_node_id[node_id].push(named_input)
						const variable = new TextureVariable(
							attrib_node.attribute_name,
							ConnectionPointComponentsCountMap[connection_point.type]
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
				case 'globals': {
					const globals_node = node as GlobalsGlNode;
					const output_names_attributes = ['position', 'normal', 'color', 'uv'];
					// const output_names_not_attributes = ['frame', 'gl_FragCoord', 'gl_PointCoord'];
					for (let output_name of globals_node.io.outputs.used_output_names()) {
						// const is_attribute = !lodash_includes(output_names_not_attributes, output_name)

						// is_attribute, as opposed to frame, gl_FragCoord and gl_PointCoord which are either uniforms or provided by the renderer
						const is_attribute = output_names_attributes.includes(output_name);

						if (is_attribute) {
							const connection_point = globals_node.io.outputs.named_output_connection_points_by_name(
								output_name
							);
							if (connection_point) {
								const gl_type = connection_point.type;
								const variable = new TextureVariable(
									output_name,
									ConnectionPointComponentsCountMap[gl_type]
								);
								variable.add_graph_node_id(node_id);
								variables.push(variable);
							}
						}
					}
					break;
				}
				case 'attribute': {
					const attribute_node = node as AttributeGlNode;
					const connection_point = attribute_node.output_connection_point();
					if (connection_point) {
						// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
						// connections_by_node_id[node_id].push(named_output)
						const variable = new TextureVariable(
							attribute_node.attribute_name,
							ConnectionPointComponentsCountMap[connection_point.type]
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
	allocate_variables(variables: TextureVariable[]) {
		const variables_by_size_inverse = lodash_sortBy(variables, (variable) => {
			return -variable.size;
		});
		for (let variable of variables_by_size_inverse) {
			this.allocate_variable(variable);
		}
	}
	allocate_variable(new_variable: TextureVariable) {
		let allocated = this.has_variable(new_variable.name);
		if (allocated) {
			const allocated_variable = this.variables().filter((v) => v.name == new_variable.name)[0];
			new_variable.graph_node_ids?.forEach((boolean, graph_node_id: string) => {
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
		return lodash_includes(names, name);
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
	to_json(scene: PolyScene): TextureAllocationsControllerData {
		return this._allocations.map((allocation: TextureAllocation) => {
			const data = {
				[allocation.texture_name]: allocation.to_json(scene),
			};
			return data;
		});
	}
	print(scene: PolyScene) {
		console.log(JSON.stringify(this.to_json(scene), [''], 2));
	}
}
