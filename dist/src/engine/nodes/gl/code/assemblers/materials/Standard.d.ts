import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ShaderAssemblerMesh } from './_BaseMesh';
import { ShaderConfig } from '../../configs/ShaderConfig';
import { VariableConfig } from '../../configs/VariableConfig';
import { OutputGlNode } from '../../../Output';
export declare class ShaderAssemblerStandard extends ShaderAssemblerMesh {
    is_physical(): boolean;
    get _template_shader(): {
        vertexShader: string;
        fragmentShader: string;
        uniforms: {
            [uniform: string]: import("three").IUniform;
        };
    };
    create_material(): ShaderMaterial;
    add_output_params(output_child: OutputGlNode): void;
    create_shader_configs(): ShaderConfig[];
    create_variable_configs(): VariableConfig[];
}
