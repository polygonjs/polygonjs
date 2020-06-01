import { TypedCopNode } from './_Base';
import { BaseParamType } from '../../params/_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class FileCopParamsConfig extends NodeParamsConfig {
    url: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    reload: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    encoding: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    mapping: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    wrap_s: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    wrap_t: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    mag_filter: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    min_filter: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    flip_y: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    offset: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    repeat: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    rotation: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    center: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    is_video: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    play: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    muted: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    loop: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    video_time: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    set_video_time: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class FileCopNode extends TypedCopNode<FileCopParamsConfig> {
    params_config: FileCopParamsConfig;
    static type(): string;
    required_modules(): void | import("../../poly/registers/modules/_BaseRegister").ModuleName[];
    private _video;
    private _texture_loader;
    static readonly VIDEO_TIME_PARAM_NAME = "video_time";
    static readonly DEFAULT_NODE_PATH: {
        UV: string;
        ENV_MAP: string;
    };
    static readonly VIDEO_EXTENSIONS: string[];
    cook(): Promise<void>;
    private _is_static_image_url;
    private cook_for_image;
    private cook_for_video;
    resolved_url(): string;
    private _update_texture_params;
    private _update_texture_transform;
    static PARAM_CALLBACK_video_update_time(node: FileCopNode): void;
    static PARAM_CALLBACK_video_update_play(node: FileCopNode): void;
    static PARAM_CALLBACK_video_update_muted(node: FileCopNode): void;
    static PARAM_CALLBACK_video_update_loop(node: FileCopNode): void;
    private video_update_time;
    private video_update_muted;
    private video_update_loop;
    private video_update_play;
    static PARAM_CALLBACK_reload(node: FileCopNode, param: BaseParamType): void;
    private param_callback_reload;
    private _load_texture;
}
export {};
