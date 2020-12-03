import {TextureVariable, TextureVariableData} from './TextureVariable';
import {BaseGlNodeType} from '../../_Base';
import {PolyScene} from '../../../../scene/PolyScene';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {AttributeGlNode} from '../../Attribute';
import {GlNodeType} from '../../../../poly/NodeContext';
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
		const variables = this.variables_for_input_node(root_node);
		if (variables) {
			if (root_node.type == GlNodeType.ATTRIBUTE) {
				// if the AttributeGlNode exports an attribute called restP,
				// the variable will be named also restP.
				// And the input of the AttributeGlNode will not be called restP,
				// so I need to make sure I only return the actual name of its input here
				return [AttributeGlNode.INPUT_NAME];
			} else {
				return variables.map((v) => v.name);
			}
		}
		// return ?.map((v) => v.name);
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
