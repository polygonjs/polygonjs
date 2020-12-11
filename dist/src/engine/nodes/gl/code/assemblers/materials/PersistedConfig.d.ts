import { BasePersistedConfig } from '../../../../utils/PersistedConfig';
import { BaseBuilderMatNodeType } from '../../../../mat/_BaseBuilder';
import { ShaderMaterialWithCustomMaterials } from '../../../../../../core/geometry/Material';
export interface PersistedConfigBaseMaterialData {
    material: object;
    param_uniform_pairs: [string, string][];
    uniforms_time_dependent?: boolean;
    uniforms_resolution_dependent?: boolean;
    custom_materials?: Dictionary<object>;
}
export declare class MaterialPersistedConfig extends BasePersistedConfig {
    protected node: BaseBuilderMatNodeType;
    private _material;
    constructor(node: BaseBuilderMatNodeType);
    to_json(): PersistedConfigBaseMaterialData | undefined;
    load(data: PersistedConfigBaseMaterialData): void;
    material(): ShaderMaterialWithCustomMaterials | undefined;
}
