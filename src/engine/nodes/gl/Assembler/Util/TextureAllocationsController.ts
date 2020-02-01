import lodash_flatten from 'lodash/flatten'
import lodash_uniq from 'lodash/uniq'
import lodash_sortBy from 'lodash/sortBy'
import lodash_includes from 'lodash/includes'
import {TextureAllocation} from './TextureAllocation'
import {BaseNodeGl} from 'src/Engine/Node/Gl/_Base'

import {TypedConnection, COMPONENTS_COUNT_BY_TYPE} from 'src/Engine/Node/Gl/GlData'
import { TextureVariable } from './TextureVariable';
import { ShaderConfig } from '../Config/ShaderConfig';
import { Scene } from 'src/Engine/Scene';

export class TextureAllocationsController {
	private _allocations: TextureAllocation[] = []
	private _next_allocation_index: number = 0

	constructor(){

	}
	allocate_connections_from_root_nodes(root_nodes: BaseNodeGl[], leaf_nodes: BaseNodeGl[]){
		// const connections_by_node_id = {}
		const variables = []

		// TODO: let's go through the output node first, in case there is a name conflict, it will have priority
		for(let node of root_nodes){
			const node_id = node.graph_node_id()
			switch(node.type()){
				case 'output':{
					for(let named_input of node.named_inputs()){
						const input = node.named_input(named_input.name())
						if(input){
							// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
							// connections_by_node_id[node_id].push(named_input)
							const variable = new TextureVariable(
								named_input.name(),
								COMPONENTS_COUNT_BY_TYPE[named_input.type()],
							)
							variable.add_graph_node_id(node_id)
							variables.push(variable)
						}
					}
					break;
				}
				case 'attribute':{
					const named_input = node.connected_input()
					if(named_input){
						// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
						// connections_by_node_id[node_id].push(named_input)
						const variable = new TextureVariable(
							node.attribute_name(),
							COMPONENTS_COUNT_BY_TYPE[named_input.type()],
						)
						variable.add_graph_node_id(node_id)
						variables.push(variable)
					}
					break;
				}
			}
		}
		for(let node of leaf_nodes){
			const node_id = node.graph_node_id()
			switch(node.type()){
				case 'globals':{
					const output_names_attributes = [
						'position',
						'normal',
						'color',
						'uv',
					]
					const output_names_not_attributes = [
						'frame',
						'gl_FragCoord',
						'gl_PointCoord',
					]
					for(let output_name of node.used_output_names()){

						// const is_attribute = !lodash_includes(output_names_not_attributes, output_name)
						const is_attribute = lodash_includes(output_names_attributes, output_name)

						if(is_attribute){
							const named_output = node.named_output_by_name(output_name)
							const gl_type = named_output.gl_type()
							const variable = new TextureVariable(
								output_name,
								COMPONENTS_COUNT_BY_TYPE[gl_type],
							)
							variable.add_graph_node_id(node_id)
							variables.push(variable)
						}

					}
					break;
				}
				case 'attribute':{
					const named_output = node.connected_output()
					if(named_output){
						// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
						// connections_by_node_id[node_id].push(named_output)
						const variable = new TextureVariable(
							node.attribute_name(),
							COMPONENTS_COUNT_BY_TYPE[named_output.type()],
						)
						variable.add_graph_node_id(node_id)
						variables.push(variable)
					}
					break;
				}
			}
		}


		this.allocate_variables(variables)
	}
	allocate_variables(variables: TextureVariable[]){
		const variables_by_size_inverse = lodash_sortBy(variables, (variable)=>{
			return -variable.size()
		})
		for(let variable of variables_by_size_inverse){
			this.allocate_variable(variable)
		}
	}
	allocate_variable(new_variable: TextureVariable){

		let allocated = this.has_variable(new_variable.name())
		if(allocated){

			const allocated_variable = this.variables().filter(v=>v.name() == new_variable.name())[0]
			for(let id of new_variable.graph_node_ids()){
				allocated_variable.add_graph_node_id(id)
			}

		} else {
			if(!allocated){
				for(let allocation of this._allocations){
					if((!allocated) && allocation.has_space_for_variable(new_variable)){
						allocation.add_variable(new_variable)
						allocated = true
					}
				}
			}
			if(!allocated){
				const new_allocation = new TextureAllocation(this.next_allocation_name())
				this._allocations.push(new_allocation)
				new_allocation.add_variable(new_variable)
			}
		}
	}

	next_allocation_name(){
		this._next_allocation_index += 1
		return `${this._next_allocation_index}`
	}


	shader_names(){
		const explicit_shader_names = this._allocations.map(a=>a.shader_name())

		// include dependencies if needed
		if(lodash_includes(explicit_shader_names, 'acceleration')){
			explicit_shader_names.push('velocity')
		}
		if(lodash_includes(explicit_shader_names, 'velocity')){
			explicit_shader_names.push('position')
		}

		return lodash_uniq(explicit_shader_names)
	}
	create_shader_configs(): ShaderConfig[]{
		return [
			// new ShaderConfig('position', ['position'], []),
			// new ShaderConfig('fragment', ['color', 'alpha'], ['vertex']),
		]
	}
	allocation_for_shader_name(shader_name: string):TextureAllocation{
		return this._allocations.filter(a=>a.shader_name() == shader_name)[0]
	}
	input_names_for_shader_name(root_node: BaseNodeGl, shader_name: string){
		const allocation = this.allocation_for_shader_name(shader_name)
		if(allocation){
			return allocation.input_names_for_node(root_node)
		}
	}
	// find_variable(root_node: BaseNodeGl, shader_name: string, input_name: string): TextureVariable{
	// 	const allocation = this.allocation_for_shader_name(shader_name)
	// 	if(allocation){
	// 		return allocation.find_variable_with_node(root_node, input_name)
	// 	}
	// }
	variable(variable_name: string): TextureVariable{
		for(let allocation of this._allocations){
			const variable = allocation.variable(variable_name)
			if(variable){
				return variable
			}
		}
	}
	variables():TextureVariable[]{
		return lodash_flatten(this._allocations.map(a=>a.variables()))
	}
	has_variable(name:string):boolean{
		const names = this.variables().map(v=>v.name())
		return lodash_includes(names, name)
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
	to_json(scene: Scene){
		return this._allocations.map(allocation=>{
			const data = {}
			data[allocation.texture_name()] = allocation.to_json(scene)
			return data
		})
	}
	print(scene: Scene){
		console.log( JSON.stringify(this.to_json(scene), '', 2) )
	}
}