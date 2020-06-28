import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TransformResetSopParamConfig extends NodeParamsConfig {
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class TransformResetSopNode extends TypedSopNode<TransformResetSopParamConfig> {
    params_config: TransformResetSopParamConfig;
    static type(): string;
    static displayed_input_names(): string[];
    private _bbox_center;
    private _translate_matrix;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _select_mode;
    private _reset_objects;
    private _center_geos;
}
export {};
