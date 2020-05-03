import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ShaderAssemblerMaterial, CustomAssemblerMap } from './_BaseMaterial';
import { ShaderConfig } from '../../configs/ShaderConfig';
import { VariableConfig } from '../../configs/VariableConfig';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
import { OutputGlNode } from '../../../Output';
import { GlConnectionPointType, GlConnectionPoint } from '../../../../utils/io/connections/Gl';
export declare class ShaderAssemblerLine extends ShaderAssemblerMaterial {
    get _template_shader(): {
        vertexShader: string;
        fragmentShader: string;
        uniforms: {
            [uniform: string]: import("three").IUniform;
        };
    };
    create_material(): ShaderMaterial;
    custom_assembler_class_by_custom_name(): CustomAssemblerMap;
    create_shader_configs(): ShaderConfig[];
    static add_output_params(output_child: OutputGlNode): void;
    add_output_params(output_child: OutputGlNode): void;
    static create_globals_node_output_connections(): (GlConnectionPoint<GlConnectionPointType.FLOAT> | GlConnectionPoint<GlConnectionPointType.VEC3> | GlConnectionPoint<GlConnectionPointType.VEC2> | GlConnectionPoint<GlConnectionPointType.VEC4>)[];
    create_globals_node_output_connections(): (GlConnectionPoint<GlConnectionPointType.FLOAT> | GlConnectionPoint<GlConnectionPointType.VEC3> | GlConnectionPoint<GlConnectionPointType.VEC2> | GlConnectionPoint<GlConnectionPointType.VEC4>)[];
    create_variable_configs(): VariableConfig[];
    protected lines_to_remove(shader_name: ShaderName): string[] | undefined;
}
