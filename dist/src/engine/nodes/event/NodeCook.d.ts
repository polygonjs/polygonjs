import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class NodeCookEventParamsConfig extends NodeParamsConfig {
    mask: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    force: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    cook_mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    batch_size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    sep: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    update_resolve: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    print_resolve: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class NodeCookEventNode extends TypedEventNode<NodeCookEventParamsConfig> {
    params_config: NodeCookEventParamsConfig;
    static type(): string;
    static readonly INPUT_TRIGGER = "trigger";
    static readonly OUTPUT_FIRST_NODE = "first";
    static readonly OUTPUT_EACH_NODE = "each";
    static readonly OUTPUT_ALL_NODES = "all";
    private _resolved_nodes;
    initialize_node(): void;
    trigger(): void;
    cook(): void;
    private process_event_trigger;
    private _cook_nodes_with_mode;
    private _cook_nodes_all_together;
    private _cook_nodes_batch;
    private _cook_nodes;
    private _cook_node;
    static PARAM_CALLBACK_update_resolved_nodes(node: NodeCookEventNode): void;
    private _update_resolved_nodes;
    private _dispatched_first_node_cooked;
    private _dispatched_all_nodes_cooked;
    private _cook_state_by_node_id;
    private _reset;
    private _all_nodes_have_cooked;
    private _on_node_cook_complete_bound;
    private _on_node_cook_complete;
    static PARAM_CALLBACK_update_resolve(node: NodeCookEventNode): void;
    static PARAM_CALLBACK_print_resolve(node: NodeCookEventNode): void;
    private print_resolve;
}
export {};
