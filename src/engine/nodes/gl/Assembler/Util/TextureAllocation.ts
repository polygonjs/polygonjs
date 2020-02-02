import lodash_includes from 'lodash/includes';

import {TextureVariable} from './TextureVariable';
import {BaseGlNodeType} from 'src/engine/nodes/gl/_Base';
import {PolyScene} from 'src/engine/scene/PolyScene';

export class TextureAllocation {
	private _variables: TextureVariable[] | undefined;
	private _size: number = 0;

	constructor(private _name: string) {}

	add_variable(variable: TextureVariable) {
		this._variables = this._variables || [];
		this._variables.push(variable);
		variable.set_position(this._size);
		variable.set_allocation(this);
		this._size += variable.size;
	}

	has_space_for_variable(variable: TextureVariable): boolean {
		return this._size + variable.size <= 4;
	}
	get shader_name(): string {
		return this._name; //this._variables[0].name()
	}
	get texture_name(): string {
		return `texture_${this.shader_name}`;
	}

	get variables(): TextureVariable[] | undefined {
		return this._variables;
	}
	variables_for_input_node(root_node: BaseGlNodeType): TextureVariable[] | undefined {
		return this._variables?.filter((variable) => variable.graph_node_ids?.has(root_node.graph_node_id) || false);
	}
	input_names_for_node(root_node: BaseGlNodeType): string[] | undefined {
		return this.variables_for_input_node(root_node)?.map((v) => v.name);
	}
	// find_variable_with_node(root_node: BaseNodeGl, input_name: string): TextureVariable{
	// 	return this.variables_for_input_node(root_node).filter(v=>v.name() == input_name)[0]
	// }
	// find_variable_without_node(input_name: string): TextureVariable{
	// 	return this._variables.filter(v=>v.name() == input_name)[0]
	// }
	variable(variable_name: string) {
		if (this._variables) {
			for (let variable of this._variables) {
				if (variable.name == variable_name) {
					return variable;
				}
			}
		}
	}

	to_json(scene: PolyScene) {
		return this._variables?.map((v) => v.to_json(scene));
		// for(let variable of this._variables){
		// 	data[variable.name()] = variable.to_json(scene)
		// }
		// return data
	}
}
