import { BasePersistedConfig } from '../../../../utils/PersistedConfig';
import { ParticlesSystemGpuSopNode } from '../../../../sop/ParticlesSystemGpu';
import { TextureAllocationsController, TextureAllocationsControllerData } from '../../utils/TextureAllocationsController';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
export interface PersistedConfigBaseParticlesData {
    shaders_by_name: Dictionary<string>;
    texture_allocations: TextureAllocationsControllerData;
    param_uniform_pairs: [string, string][];
    uniforms_owner: object;
}
export declare class ParticlesPersistedConfig extends BasePersistedConfig {
    protected node: ParticlesSystemGpuSopNode;
    private _loaded_data;
    constructor(node: ParticlesSystemGpuSopNode);
    to_json(): PersistedConfigBaseParticlesData | undefined;
    load(data: PersistedConfigBaseParticlesData): void;
    loaded_data(): PersistedConfigBaseParticlesData | undefined;
    shaders_by_name(): Map<ShaderName, string> | undefined;
    texture_allocations_controller(): TextureAllocationsController | undefined;
    uniforms(): {
        [uniform: string]: import("three").IUniform;
    } | undefined;
}
