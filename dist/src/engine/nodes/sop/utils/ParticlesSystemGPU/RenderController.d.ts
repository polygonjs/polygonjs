import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Object3D } from 'three/src/core/Object3D';
import { ParticlesSystemGpuSopNode } from '../../ParticlesSystemGpu';
import { CoreGroup } from '../../../../../core/geometry/Group';
import { ShaderName } from '../../../utils/shaders/ShaderName';
export declare class ParticlesSystemGpuRenderController {
    private node;
    private _render_material;
    protected _particles_group_objects: Object3D[];
    private _shaders_by_name;
    private _all_shader_names;
    private _all_uniform_names;
    private _texture_allocations_json;
    private globals_handler;
    constructor(node: ParticlesSystemGpuSopNode);
    set_shaders_by_name(shaders_by_name: Map<ShaderName, string>): void;
    assign_render_material(): void;
    update_render_material_uniforms(): void;
    reset_render_material(): void;
    render_material(): ShaderMaterial | undefined;
    get initialized(): boolean;
    init_core_group(core_group: CoreGroup): void;
    init_render_material(): Promise<void>;
}
