import { TypedAnimNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TransformAnimParamsConfig extends NodeParamsConfig {
    object: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    start_frame: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    end_frame: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    cache: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class TransformAnimNode extends TypedAnimNode<TransformAnimParamsConfig> {
    params_config: TransformAnimParamsConfig;
    static type(): Readonly<'transform'>;
    private _dummy_clip;
    private _cached_clip;
    cook(): void;
    static PARAM_CALLBACK_cache(node: TransformAnimNode): void;
    private _resolved_node;
    private _times;
    private _values_t;
    private _values_r;
    private _values_s;
    private _cache;
    init_cache(): Promise<void>;
    cache_current_frame(): Promise<void>;
    create_clip_from_cached_frames(): void;
    private _reset_cache;
    private _object_t;
    private _object_q;
    private _object_s;
    private _get_resolved_object;
}
export {};
