import {TextureVariable, TextureVariableData} from './TextureVariable';
import {BaseGlNodeType} from '../../_Base';
import {PolyScene} from '../../../../scene/PolyScene';
import {ShaderName} from '../../../utils/shaders/ShaderName';
export type TextureAllocationData = TextureVariableData[];

const TEXTURE_PREFIX = 'texture_';

export class TextureAllocation {
	private _variables: TextureVariable[] | undefined;
	private _size: number = 0;

	constructor(private _shader_name: ShaderName) {}

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
	get size() {
		return this._size;
	}
	get shader_name() {
		return this._shader_name; //this._variables[0].name()
	}
	get texture_name(): string {
		return `${TEXTURE_PREFIX}${this._shader_name}`;
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

	static from_json(data: TextureAllocationData, shader_name: ShaderName): TextureAllocation {
		const texture_allocation = new TextureAllocation(shader_name);
		for (let datum of data) {
			const texture_variable = TextureVariable.from_json(datum);
			texture_allocation.add_variable(texture_variable);
		}
		return texture_allocation;
	}

	to_json(scene: PolyScene): TextureAllocationData {
		if (this._variables) {
			return this._variables.map((v) => v.to_json(scene));
		} else {
			return [];
		}
		// for(let variable of this._variables){
		// 	data[variable.name()] = variable.to_json(scene)
		// }
		// return data
	}
}
