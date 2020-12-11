import { Texture } from 'three/src/textures/Texture';
import { TypedCopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class EnvMapCopParamsConfig extends NodeParamsConfig {
    use_camera_renderer: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class EnvMapCopNode extends TypedCopNode<EnvMapCopParamsConfig> {
    params_config: EnvMapCopParamsConfig;
    static type(): string;
    private _data_texture_controller;
    private _renderer_controller;
    initialize_node(): void;
    cook(input_contents: Texture[]): Promise<void>;
    private convert_texture_to_env_map;
}
export {};
