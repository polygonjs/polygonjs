import { ShaderName } from '../../../utils/shaders/ShaderName';
import { BaseGLDefinition } from '../../utils/GLDefinition';
import { BaseGlNodeType } from '../../_Base';
export declare class LinesController {
    private _shader_name;
    private _definitions_by_node_id;
    private _body_lines_by_node_id;
    constructor(_shader_name: ShaderName);
    get shader_name(): ShaderName;
    add_definitions(node: BaseGlNodeType, definitions: BaseGLDefinition[]): void;
    definitions(node: BaseGlNodeType): BaseGLDefinition[] | undefined;
    add_body_lines(node: BaseGlNodeType, lines: string[]): void;
    body_lines(node: BaseGlNodeType): string[] | undefined;
}
