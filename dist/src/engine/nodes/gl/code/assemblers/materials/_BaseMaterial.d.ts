import { BaseGlShaderAssembler } from '../_Base';
import { OutputGlNode } from '../../../Output';
import { AttributeGlNode } from '../../../Attribute';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
import { GlobalsGlNode } from '../../../Globals';
import { ShaderMaterialWithCustomMaterials } from '../../../../../../core/geometry/Material';
import { ShadersCollectionController } from '../../utils/ShadersCollectionController';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
export declare enum CustomMaterialName {
    DISTANCE = "customDistanceMaterial",
    DEPTH = "customDepthMaterial",
    DEPTH_DOF = "customDepthDOFMaterial"
}
export declare type CustomAssemblerMap = Map<CustomMaterialName, typeof ShaderAssemblerMaterial>;
export declare class ShaderAssemblerMaterial extends BaseGlShaderAssembler {
    private _assemblers_by_custom_name;
    create_material(): ShaderMaterial;
    custom_assembler_class_by_custom_name(): CustomAssemblerMap | undefined;
    protected _add_custom_materials(material: ShaderMaterial): void;
    private _add_custom_material;
    compile_custom_materials(material: ShaderMaterialWithCustomMaterials): Promise<void>;
    compile_material(material: ShaderMaterial): Promise<void>;
    private _update_shaders;
    shadow_assembler_class_by_custom_name(): {};
    add_output_body_line(output_node: OutputGlNode, shaders_collection_controller: ShadersCollectionController, input_name: string): void;
    set_node_lines_output(output_node: OutputGlNode, shaders_collection_controller: ShadersCollectionController): void;
    set_node_lines_attribute(attribute_node: AttributeGlNode, shaders_collection_controller: ShadersCollectionController): void;
    handle_gl_FragCoord(body_lines: string[], shader_name: ShaderName, var_name: string): void;
    handle_resolution(body_lines: string[], shader_name: ShaderName, var_name: string): void;
    set_node_lines_globals(globals_node: GlobalsGlNode, shaders_collection_controller: ShadersCollectionController): void;
}
