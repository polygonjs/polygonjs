import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ShaderAssemblerMaterial, CustomAssemblerMap } from './_BaseMaterial';
import { ShaderConfig } from '../../configs/ShaderConfig';
import { VariableConfig } from '../../configs/VariableConfig';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
import { OutputGlNode } from '../../../Output';
import { TypedNamedConnectionPoint } from '../../../../utils/connections/NamedConnectionPoint';
import { ConnectionPointType } from '../../../../utils/connections/ConnectionPointType';
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
    static create_globals_node_output_connections(): (TypedNamedConnectionPoint<ConnectionPointType.VEC3> | TypedNamedConnectionPoint<ConnectionPointType.VEC2> | TypedNamedConnectionPoint<ConnectionPointType.VEC4> | TypedNamedConnectionPoint<ConnectionPointType.FLOAT>)[];
    create_globals_node_output_connections(): (TypedNamedConnectionPoint<ConnectionPointType.VEC3> | TypedNamedConnectionPoint<ConnectionPointType.VEC2> | TypedNamedConnectionPoint<ConnectionPointType.VEC4> | TypedNamedConnectionPoint<ConnectionPointType.FLOAT>)[];
    create_variable_configs(): VariableConfig[];
    protected lines_to_remove(shader_name: ShaderName): string[] | undefined;
}
