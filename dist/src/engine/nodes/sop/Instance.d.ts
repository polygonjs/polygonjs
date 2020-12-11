import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class InstanceSopParamsConfig extends NodeParamsConfig {
    attributes_to_copy: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    apply_material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.NODE_PATH>;
}
export declare class InstanceSopNode extends TypedSopNode<InstanceSopParamsConfig> {
    params_config: InstanceSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    private _on_create_bound;
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): Promise<void>;
    private _on_create;
}
export {};
