import { BaseNodeType } from '../_Base';
import { NodeUIDataJson } from './UIData';
import { BaseConnectionPointData } from './io/connections/_Base';
export interface NodeSerializerData {
    name: string;
    type: string;
    graph_node_id: string;
    is_dirty: boolean;
    ui_data_json: NodeUIDataJson;
    error_message: string | undefined;
    children: string[];
    inputs: Array<string | undefined>;
    input_connection_output_indices: Array<number | undefined> | undefined;
    named_input_connection_points: BaseConnectionPointData[];
    named_output_connection_points: BaseConnectionPointData[];
    param_ids: string[];
    override_cloned_state_allowed: boolean;
    inputs_clone_required_states: boolean | boolean[];
    flags?: {
        display?: boolean;
        bypass?: boolean;
    };
    selection?: string[];
}
export declare class NodeSerializer {
    private node;
    constructor(node: BaseNodeType);
    to_json(include_param_components?: boolean): NodeSerializerData;
    children_ids(): string[];
    input_ids(): (string | undefined)[];
    input_connection_output_indices(): (number | undefined)[] | undefined;
    named_input_connection_points(): any[];
    named_output_connection_points(): any[];
    to_json_params_from_names(param_names: string[], include_components?: boolean): string[];
    to_json_params(include_components?: boolean): string[];
}
