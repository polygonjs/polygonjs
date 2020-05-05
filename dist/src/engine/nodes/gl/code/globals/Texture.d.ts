import { GlobalsBaseController } from './_Base';
import { GlobalsGlNode } from '../../Globals';
import { BaseGlNodeType } from '../../_Base';
import { TextureAllocationsController } from '../utils/TextureAllocationsController';
import { GlConnectionPointType } from '../../../utils/io/connections/Gl';
import { ShadersCollectionController } from '../utils/ShadersCollectionController';
export declare class GlobalsTextureHandler extends GlobalsBaseController {
    private _uv_name;
    private _texture_allocations_controller;
    static UV_ATTRIB: string;
    static UV_VARYING: string;
    static PARTICLE_SIM_UV: string;
    private globals_geometry_handler;
    constructor(_uv_name: string);
    set_texture_allocations_controller(controller: TextureAllocationsController): void;
    handle_globals_node(globals_node: GlobalsGlNode, output_name: string, shaders_collection_controller: ShadersCollectionController): void;
    read_attribute(node: BaseGlNodeType, gl_type: GlConnectionPointType, attrib_name: string, shaders_collection_controller: ShadersCollectionController): string | undefined;
    add_particles_sim_uv_attribute(node: BaseGlNodeType, shaders_collection_controller: ShadersCollectionController): void;
}
