import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ShaderAssemblerMaterial, CustomAssemblerMap } from './_BaseMaterial';
import { ShaderConfig } from '../../configs/ShaderConfig';
import { VariableConfig } from '../../configs/VariableConfig';
import { OutputGlNode } from '../../../Output';
import { GlConnectionPointType, GlConnectionPoint } from '../../../../utils/io/connections/Gl';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
export declare class ShaderAssemblerPoints extends ShaderAssemblerMaterial {
    custom_assembler_class_by_custom_name(): CustomAssemblerMap;
    get _template_shader(): {
        vertexShader: string;
        fragmentShader: string;
        uniforms: {
            [uniform: string]: import("three").IUniform;
        };
    };
    create_material(): ShaderMaterial;
    add_output_params(output_child: OutputGlNode): void;
    create_globals_node_output_connections(): (GlConnectionPoint<GlConnectionPointType.FLOAT> | GlConnectionPoint<GlConnectionPointType.VEC3> | GlConnectionPoint<GlConnectionPointType.VEC2> | GlConnectionPoint<GlConnectionPointType.VEC4>)[];
    create_shader_configs(): ShaderConfig[];
    create_variable_configs(): VariableConfig[];
    protected lines_to_remove(shader_name: ShaderName): string[] | undefined;
}
