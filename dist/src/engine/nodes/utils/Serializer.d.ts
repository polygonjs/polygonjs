import { BaseNodeType } from '../_Base';
import { NodeUIDataJson } from './UIData';
import { TypedNamedConnectionPointData } from './connections/NamedConnectionPoint';
import { ConnectionPointType } from './connections/ConnectionPointType';
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
    named_input_connections: TypedNamedConnectionPointData<ConnectionPointType>[];
    named_output_connections: TypedNamedConnectionPointData<ConnectionPointType>[];
    param_ids: string[];
    override_clonable_state: boolean;
    inputs_clonable_state_with_override: boolean[];
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
    connection_input_indices(): (number | undefined)[] | undefined;
    named_input_connections(): TypedNamedConnectionPointData<ConnectionPointType>[];
    named_output_connections(): TypedNamedConnectionPointData<ConnectionPointType>[];
    to_json_params_from_names(param_names: string[], include_components?: boolean): string[];
    to_json_params(include_components?: boolean): string[];
}
