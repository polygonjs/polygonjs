import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { NetworkChildNodeType } from '../../poly/NodeContext';
declare class SubnetInputSopParamsConfig extends NodeParamsConfig {
    input: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class SubnetInputSopNode extends TypedSopNode<SubnetInputSopParamsConfig> {
    params_config: SubnetInputSopParamsConfig;
    static type(): NetworkChildNodeType;
    private _current_parent_input_graph_node;
    initialize_node(): void;
    cook(): Promise<void>;
    static PARAM_CALLBACK_reset(node: SubnetInputSopNode): void;
    private set_parent_input_dependency;
}
export {};
