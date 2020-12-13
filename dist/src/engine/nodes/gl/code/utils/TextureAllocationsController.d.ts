import { TextureAllocation, TextureAllocationData } from './TextureAllocation';
import { BaseGlNodeType } from '../../_Base';
import { TextureVariable } from './TextureVariable';
import { ShaderConfig } from '../configs/ShaderConfig';
import { ShaderName } from '../../../utils/shaders/ShaderName';
import { PolyScene } from '../../../../scene/PolyScene';
export declare type TextureAllocationsControllerData = Dictionary<TextureAllocationData>[];
export declare class TextureAllocationsController {
    private _allocations;
    private _next_allocation_index;
    constructor();
    allocate_connections_from_root_nodes(root_nodes: BaseGlNodeType[], leaf_nodes: BaseGlNodeType[]): void;
    private allocate_variables;
    private allocate_variable;
    private add_allocation;
    next_allocation_name(): ShaderName;
    shader_names(): ShaderName[];
    create_shader_configs(): ShaderConfig[];
    allocation_for_shader_name(shader_name: ShaderName): TextureAllocation;
    input_names_for_shader_name(root_node: BaseGlNodeType, shader_name: ShaderName): string[] | undefined;
    variable(variable_name: string): TextureVariable | undefined;
    variables(): TextureVariable[];
    has_variable(name: string): boolean;
    static from_json(data: TextureAllocationsControllerData): TextureAllocationsController;
    to_json(scene: PolyScene): TextureAllocationsControllerData;
    print(scene: PolyScene): void;
}
