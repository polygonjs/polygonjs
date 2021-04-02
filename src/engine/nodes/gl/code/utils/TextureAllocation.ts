import {TextureVariable, TextureVariableData} from './TextureVariable';
import {BaseGlNodeType} from '../../_Base';
import {PolyScene} from '../../../../scene/PolyScene';
import {AttributeGlNode} from '../../Attribute';
import {GlNodeType} from '../../../../poly/NodeContext';
import {ShaderName} from '../../../utils/shaders/ShaderName';
export type TextureAllocationData = TextureVariableData[];

const TEXTURE_PREFIX = 'texture_';

export class TextureAllocation {
	private _variables: TextureVariable[] | undefined;
	private _size: number = 0;

	constructor(/*private _shader_name: ShaderName*/) {}

	addVariable(variable: TextureVariable) {
		this._variables = this._variables || [];
		this._variables.push(variable);
		variable.setPosition(this._size);
		variable.setAllocation(this);
		this._size += variable.size();
	}

	hasSpaceForVariable(variable: TextureVariable): boolean {
		return this._size + variable.size() <= 4;
	}

	shaderName() {
		// return this._shader_name; //this._variables[0].name()
		const names = this.variables()?.map((v) => v.name()) || ['no_variables_allocated'];
		return names.join('_SEPARATOR_') as ShaderName;
	}
	textureName(): string {
		return `${TEXTURE_PREFIX}${this.shaderName()}`;
	}

	variables(): TextureVariable[] | undefined {
		return this._variables;
	}
	variablesForInputNode(root_node: BaseGlNodeType): TextureVariable[] | undefined {
		return this._variables?.filter((variable) => variable.graphNodeIds()?.has(root_node.graphNodeId()) || false);
	}
	inputNamesForNode(root_node: BaseGlNodeType): string[] | undefined {
		const variables = this.variablesForInputNode(root_node);
		if (variables) {
			if (root_node.type() == GlNodeType.ATTRIBUTE) {
				// if the AttributeGlNode exports an attribute called restP,
				// the variable will be named also restP.
				// And the input of the AttributeGlNode will not be called restP,
				// so I need to make sure I only return the actual name of its input here
				return [AttributeGlNode.INPUT_NAME];
			} else {
				return variables.map((v) => v.name());
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
				if (variable.name() == variable_name) {
					return variable;
				}
			}
		}
	}

	static fromJSON(data: TextureAllocationData): TextureAllocation {
		const texture_allocation = new TextureAllocation();
		for (let datum of data) {
			const texture_variable = TextureVariable.fromJSON(datum);
			texture_allocation.addVariable(texture_variable);
		}
		return texture_allocation;
	}

	toJSON(scene: PolyScene): TextureAllocationData {
		if (this._variables) {
			return this._variables.map((v) => v.toJSON(scene));
		} else {
			return [];
		}
		// for(let variable of this._variables){
		// 	data[variable.name()] = variable.toJSON(scene)
		// }
		// return data
	}
}
