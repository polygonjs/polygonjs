import { BaseGlShaderAssembler } from '../_Base';
import { OutputGlNode } from '../../../Output';
import { AttributeGlNode } from '../../../Attribute';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
import { GlobalsGlNode } from '../../../Globals';
import { BaseGLDefinition } from '../../../utils/GLDefinition';
import { ShaderMaterialWithCustomMaterials } from '../../../../../../core/geometry/Material';
import { ShadersCollectionController } from '../../utils/ShadersCollectionController';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
export declare enum CustomMaterialName {
    DISTANCE = "customDistanceMaterial",
    DEPTH = "customDepthMaterial",
    DEPTH_DOF = "customDepthDOFMaterial"
}
export declare type CustomAssemblerMap = Map<CustomMaterialName, typeof ShaderAssemblerMaterial>;
export declare enum GlobalsOutput {
    TIME = "time",
    RESOLUTION = "resolution",
    GL_FRAGCOORD = "gl_FragCoord",
    GL_POINTCOORD = "gl_PointCoord"
}
interface HandleGlobalsOutputOptions {
    globals_node: GlobalsGlNode;
    shaders_collection_controller: ShadersCollectionController;
    output_name: string;
    globals_shader_name: ShaderName;
    definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]>;
    body_lines: string[];
    var_name: string;
    shader_name: ShaderName;
    dependencies: ShaderName[];
    body_lines_by_shader_name: Map<ShaderName, string[]>;
}
export declare class ShaderAssemblerMaterial extends BaseGlShaderAssembler {
    private _assemblers_by_custom_name;
    create_material(): ShaderMaterial;
    custom_assembler_class_by_custom_name(): CustomAssemblerMap | undefined;
    protected _add_custom_materials(material: ShaderMaterial): void;
    private _add_custom_material;
    compile_custom_materials(material: ShaderMaterialWithCustomMaterials): void;
    compile_material(material: ShaderMaterial): void;
    private _update_shaders;
    shadow_assembler_class_by_custom_name(): {};
    add_output_body_line(output_node: OutputGlNode, shaders_collection_controller: ShadersCollectionController, input_name: string): void;
    set_node_lines_output(output_node: OutputGlNode, shaders_collection_controller: ShadersCollectionController): void;
    set_node_lines_attribute(attribute_node: AttributeGlNode, shaders_collection_controller: ShadersCollectionController): void;
    handle_globals_output_name(options: HandleGlobalsOutputOptions): void;
    handle_time(options: HandleGlobalsOutputOptions): void;
    handle_resolution(options: HandleGlobalsOutputOptions): void;
    handle_gl_FragCoord(options: HandleGlobalsOutputOptions): void;
    handle_gl_PointCoord(options: HandleGlobalsOutputOptions): void;
    set_node_lines_globals(globals_node: GlobalsGlNode, shaders_collection_controller: ShadersCollectionController): void;
    private used_output_names_for_shader;
}
export {};
