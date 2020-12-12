import { TypedInputEventNode } from './_BaseInput';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SceneEventParamsConfig extends NodeParamsConfig {
    active: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    sep: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    scene_loaded: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    play: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    pause: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    tick: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    sep0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    treached_time: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    reached_time: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    sep1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    set_frame_value: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    set_frame: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class SceneEventNode extends TypedInputEventNode<SceneEventParamsConfig> {
    params_config: SceneEventParamsConfig;
    static type(): string;
    private graph_node;
    protected accepted_event_types(): string[];
    initialize_node(): void;
    private on_set_frame;
    private on_frame_update;
    private update_time_dependency;
    static PARAM_CALLBACK_set_frame(node: SceneEventNode): void;
    static PARAM_CALLBACK_update_time_dependency(node: SceneEventNode): void;
}
export {};
