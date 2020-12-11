import { TypedBuilderMatNode } from './_BaseBuilder';
import { ShaderAssemblerVolume } from '../gl/code/assemblers/materials/Volume';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { AssemblerName } from '../../poly/registers/assemblers/_BaseRegister';
declare class VolumeMatParamsConfig extends NodeParamsConfig {
    color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    step_size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    density: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    shadow_density: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    light_dir: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class VolumeBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerVolume, VolumeMatParamsConfig> {
    params_config: VolumeMatParamsConfig;
    static type(): string;
    used_assembler(): Readonly<AssemblerName.GL_VOLUME>;
    protected _create_assembler_controller(): import("../gl/code/Controller").GlAssemblerController<ShaderAssemblerVolume> | undefined;
    private _volume_controller;
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};
