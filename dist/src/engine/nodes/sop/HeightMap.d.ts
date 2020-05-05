import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
declare class HeightMapSopParamsConfig extends NodeParamsConfig {
    texture: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    mult: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class HeightMapSopNode extends TypedSopNode<HeightMapSopParamsConfig> {
    params_config: HeightMapSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): Promise<void>;
    private _set_position_from_data_texture;
    private _data_from_texture;
    private _data_from_default_texture;
    private _data_from_data_texture;
}
export {};
