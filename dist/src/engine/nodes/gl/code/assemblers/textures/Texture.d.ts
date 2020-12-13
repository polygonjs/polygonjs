import { BaseGlShaderAssembler } from '../_Base';
import { IUniforms } from '../../../../../../core/geometry/Material';
import { ShaderConfig } from '../../configs/ShaderConfig';
import { VariableConfig } from '../../configs/VariableConfig';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
import { OutputGlNode } from '../../../Output';
import { GlobalsGlNode } from '../../../Globals';
import { ShadersCollectionController } from '../../utils/ShadersCollectionController';
export declare class ShaderAssemblerTexture extends BaseGlShaderAssembler {
    private _uniforms;
    get _template_shader(): {
        fragmentShader: string;
        vertexShader: undefined;
        uniforms: undefined;
    };
    fragment_shader(): string | undefined;
    uniforms(): IUniforms | undefined;
    update_fragment_shader(): void;
    add_output_inputs(output_child: OutputGlNode): void;
    add_globals_outputs(globals_node: GlobalsGlNode): void;
    create_shader_configs(): ShaderConfig[];
    create_variable_configs(): VariableConfig[];
    protected insert_define_after(shader_name: ShaderName): string;
    protected insert_body_after(shader_name: ShaderName): string;
    protected lines_to_remove(shader_name: ShaderName): string[];
    handle_gl_FragCoord(body_lines: string[], shader_name: ShaderName, var_name: string): void;
    set_node_lines_output(output_node: OutputGlNode, shaders_collection_controller: ShadersCollectionController): void;
    set_node_lines_globals(globals_node: GlobalsGlNode, shaders_collection_controller: ShadersCollectionController): void;
}
