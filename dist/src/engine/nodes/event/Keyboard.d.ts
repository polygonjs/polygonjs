import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TypedInputEventNode } from './_BaseInput';
declare class KeyboardEventParamsConfig extends NodeParamsConfig {
    active: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    sep: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    keydown: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    keypress: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    keyup: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class KeyboardEventNode extends TypedInputEventNode<KeyboardEventParamsConfig> {
    params_config: KeyboardEventParamsConfig;
    static type(): string;
    protected accepted_event_types(): string[];
    initialize_node(): void;
}
export {};
