import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ShaderAssemblerMaterial, CustomAssemblerMap } from './_BaseMaterial';
import { ShaderConfig } from '../../configs/ShaderConfig';
import { VariableConfig } from '../../configs/VariableConfig';
import { OutputGlNode } from '../../../Output';
import { TypedNamedConnectionPoint } from '../../../../utils/connections/NamedConnectionPoint';
import { ConnectionPointType } from '../../../../utils/connections/ConnectionPointType';
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
    create_globals_node_output_connections(): (TypedNamedConnectionPoint<ConnectionPointType.VEC3> | TypedNamedConnectionPoint<ConnectionPointType.VEC2> | TypedNamedConnectionPoint<ConnectionPointType.VEC4> | TypedNamedConnectionPoint<ConnectionPointType.FLOAT>)[];
    create_shader_configs(): ShaderConfig[];
    create_variable_configs(): VariableConfig[];
    protected lines_to_remove(shader_name: ShaderName): string[] | undefined;
}
