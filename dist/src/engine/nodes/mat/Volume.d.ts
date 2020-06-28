import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { TypedMatNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class VolumeMatParamsConfig extends NodeParamsConfig {
    color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    step_size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    density: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    shadow_density: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    light_dir: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class VolumeMatNode extends TypedMatNode<ShaderMaterial, VolumeMatParamsConfig> {
    params_config: VolumeMatParamsConfig;
    static type(): string;
    private _volume_controller;
    create_material(): ShaderMaterial;
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};
