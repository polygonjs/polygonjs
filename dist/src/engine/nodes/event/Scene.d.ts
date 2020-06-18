import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TypedInputEventNode } from './_BaseInput';
declare class SceneEventParamsConfig extends NodeParamsConfig {
    active: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    sep: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    scene_loaded: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    play: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    pause: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    tick: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class SceneEventNode extends TypedInputEventNode<SceneEventParamsConfig> {
    params_config: SceneEventParamsConfig;
    static type(): string;
    protected accepted_event_types(): string[];
    initialize_node(): void;
}
export {};
