import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class BoxSopParamsConfig extends NodeParamsConfig {
    size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    divisions: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    center: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class BoxSopNode extends TypedSopNode<BoxSopParamsConfig> {
    params_config: BoxSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    private _core_transform;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _cook_without_input;
    private _cook_with_input;
}
export {};
