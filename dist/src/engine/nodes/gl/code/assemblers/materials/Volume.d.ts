import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { BaseShaderAssemblerVolume } from './_BaseVolume';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
import { OutputGlNode } from '../../../Output';
import { GlConnectionPointType, GlConnectionPoint } from '../../../../utils/io/connections/Gl';
import { ShaderConfig } from '../../configs/ShaderConfig';
import { VariableConfig } from '../../configs/VariableConfig';
import { GlobalsGlNode } from '../../../Globals';
import { ShadersCollectionController } from '../../utils/ShadersCollectionController';
export declare class ShaderAssemblerVolume extends BaseShaderAssemblerVolume {
    get _template_shader(): {
        vertexShader: string;
        fragmentShader: string;
        uniforms: any;
    };
    create_material(): ShaderMaterial;
    static add_output_params(output_child: OutputGlNode): void;
    add_output_params(output_child: OutputGlNode): void;
    static create_globals_node_output_connections(): (GlConnectionPoint<GlConnectionPointType.FLOAT> | GlConnectionPoint<GlConnectionPointType.VEC3>)[];
    create_globals_node_output_connections(): (GlConnectionPoint<GlConnectionPointType.FLOAT> | GlConnectionPoint<GlConnectionPointType.VEC3>)[];
    protected insert_body_after(shader_name: ShaderName): string | undefined;
    protected lines_to_remove(shader_name: ShaderName): string[] | undefined;
    create_shader_configs(): ShaderConfig[];
    static create_variable_configs(): VariableConfig[];
    create_variable_configs(): VariableConfig[];
    set_node_lines_globals(globals_node: GlobalsGlNode, shaders_collection_controller: ShadersCollectionController): void;
}
