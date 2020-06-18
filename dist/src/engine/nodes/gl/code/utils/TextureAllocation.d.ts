import { TextureVariable, TextureVariableData } from './TextureVariable';
import { BaseGlNodeType } from '../../_Base';
import { PolyScene } from '../../../../scene/PolyScene';
import { ShaderName } from '../../../utils/shaders/ShaderName';
export declare type TextureAllocationData = TextureVariableData[];
export declare class TextureAllocation {
    private _shader_name;
    private _variables;
    private _size;
    constructor(_shader_name: ShaderName);
    add_variable(variable: TextureVariable): void;
    has_space_for_variable(variable: TextureVariable): boolean;
    get size(): number;
    get shader_name(): ShaderName;
    get texture_name(): string;
    get variables(): TextureVariable[] | undefined;
    variables_for_input_node(root_node: BaseGlNodeType): TextureVariable[] | undefined;
    input_names_for_node(root_node: BaseGlNodeType): string[] | undefined;
    variable(variable_name: string): TextureVariable | undefined;
    static from_json(data: TextureAllocationData, shader_name: ShaderName): TextureAllocation;
    to_json(scene: PolyScene): TextureAllocationData;
}
