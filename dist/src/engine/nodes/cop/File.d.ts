import { TypedCopNode } from './_Base';
import { ParamType } from '../../poly/ParamType';
import { BaseParamType } from '../../params/_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class FileCopParamsConfig extends NodeParamsConfig {
    url: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.STRING>;
    reload: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.BUTTON>;
    mapping: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.INTEGER>;
    wrap_s: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.INTEGER>;
    wrap_t: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.INTEGER>;
    mag_filter: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.INTEGER>;
    min_filter: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.INTEGER>;
}
export declare class FileCopNode extends TypedCopNode<FileCopParamsConfig> {
    params_config: FileCopParamsConfig;
    private _previous_param_url;
    private _video;
    static type(): string;
    private _texture_loader;
    static readonly VIDEO_TIME_PARAM_NAME = "video_time";
    static readonly DEFAULT_NODE_PATH: {
        UV: string;
        ENV_MAP: string;
    };
    cook(): Promise<void>;
    private _is_static_image_url;
    private cook_for_image;
    private cook_for_video;
    resolved_url(): string;
    private _update_texture_params;
    static PARAM_CALLBACK_reload(node: FileCopNode, param: BaseParamType): void;
    private param_callback_reload;
    private _set_video_current_time;
    private _add_video_spare_params_if_required;
    private _remove_spare_params;
    private _param_url_changed;
    private _load_texture;
}
export {};
