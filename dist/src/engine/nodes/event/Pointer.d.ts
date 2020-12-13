import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TypedInputEventNode } from './_BaseInput';
declare class PointerEventParamsConfig extends NodeParamsConfig {
    active: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    sep: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    pointerdown: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    pointermove: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    pointerup: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class PointerEventNode extends TypedInputEventNode<PointerEventParamsConfig> {
    params_config: PointerEventParamsConfig;
    static type(): string;
    protected accepted_event_types(): string[];
    initialize_node(): void;
}
export {};
