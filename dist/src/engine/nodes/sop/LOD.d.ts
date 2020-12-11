import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class LODSopParamsConfig extends NodeParamsConfig {
    distance0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    distance1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    auto_update: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    update: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class LODSopNode extends TypedSopNode<LODSopParamsConfig> {
    params_config: LODSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    private _lod;
    initialize_node(): void;
    private _create_LOD;
    cook(input_contents: CoreGroup[]): void;
    _add_level(core_group: CoreGroup | undefined, level: number): void;
    private _clear_lod;
    static PARAM_CALLBACK_update(node: LODSopNode): void;
    private _update_lod;
}
export {};
