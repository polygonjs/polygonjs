import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TransformCopySopParamConfig extends NodeParamsConfig {
    use_second_input: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    reference: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class TransformCopySopNode extends TypedSopNode<TransformCopySopParamConfig> {
    params_config: TransformCopySopParamConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _copy_from_src_objects;
    private _copy_from_found_node;
}
export {};
