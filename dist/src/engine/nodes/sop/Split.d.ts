import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class DeleteSopParamsConfig extends NodeParamsConfig {
    attrib_type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    attrib_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class SplitSopNode extends TypedSopNode<DeleteSopParamsConfig> {
    params_config: DeleteSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    private _new_objects;
    cook(input_contents: CoreGroup[]): Promise<void>;
    _split_core_group(core_group: CoreGroup): Promise<void>;
    private _split_core_object;
}
export {};
