import { BaseNodeType } from '../_Base';
import { NodeUIDataJson } from './UIData';
import { BaseConnectionPointData } from './io/connections/_Base';
import { CoreGraphNodeId } from '../../../core/graph/CoreGraph';
export interface NodeSerializerData {
    name: string;
    type: string;
    graph_node_id: CoreGraphNodeId;
    is_dirty: boolean;
    ui_data_json: NodeUIDataJson;
    error_message: string | undefined;
    children: CoreGraphNodeId[];
    inputs: Array<CoreGraphNodeId | undefined>;
    input_connection_output_indices: Array<number | undefined> | undefined;
    named_input_connection_points: BaseConnectionPointData[];
    named_output_connection_points: BaseConnectionPointData[];
    param_ids: CoreGraphNodeId[];
    override_cloned_state_allowed: boolean;
    inputs_clone_required_states: boolean | boolean[];
    flags?: {
        display?: boolean;
        bypass?: boolean;
        optimize?: boolean;
    };
    selection?: CoreGraphNodeId[];
}
export declare class NodeSerializer {
    private node;
    constructor(node: BaseNodeType);
    to_json(include_param_components?: boolean): NodeSerializerData;
    children_ids(): number[];
    input_ids(): (CoreGraphNodeId | undefined)[];
    input_connection_output_indices(): (number | undefined)[] | undefined;
    named_input_connection_points(): any[];
    named_output_connection_points(): any[];
    to_json_params_from_names(param_names: string[], include_components?: boolean): number[];
    to_json_params(include_components?: boolean): number[];
}
