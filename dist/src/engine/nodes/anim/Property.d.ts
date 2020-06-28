import { TypedAnimNode } from './_Base';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class PropertyAnimParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    value1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    value2: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    value3: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    value4: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR4>;
}
export declare class PropertyAnimNode extends TypedAnimNode<PropertyAnimParamsConfig> {
    params_config: PropertyAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: TimelineBuilder[]): void;
}
export {};
