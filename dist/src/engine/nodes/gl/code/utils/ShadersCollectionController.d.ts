import { ShaderName } from '../../../utils/shaders/ShaderName';
import { BaseGLDefinition } from '../../utils/GLDefinition';
import { BaseGlNodeType } from '../../_Base';
export declare class ShadersCollectionController {
    private _shader_names;
    private _current_shader_name;
    private _lines_controller_by_shader_name;
    constructor(_shader_names: ShaderName[], _current_shader_name: ShaderName);
    get shader_names(): ShaderName[];
    set_current_shader_name(shader_name: ShaderName): void;
    get current_shader_name(): ShaderName;
    add_definitions(node: BaseGlNodeType, definitions: BaseGLDefinition[], shader_name?: ShaderName): void;
    definitions(shader_name: ShaderName, node: BaseGlNodeType): BaseGLDefinition[] | undefined;
    add_body_lines(node: BaseGlNodeType, lines: string[], shader_name?: ShaderName): void;
    body_lines(shader_name: ShaderName, node: BaseGlNodeType): string[] | undefined;
}
