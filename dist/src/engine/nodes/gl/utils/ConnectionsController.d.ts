import { ConnectionPointType } from '../../utils/connections/ConnectionPointType';
import { BaseGlNodeType } from '../_Base';
import { CoreGraphNode } from '../../../../core/graph/CoreGraphNode';
import { NodeConnection } from '../../utils/connections/NodeConnection';
declare type IONameFunction = (index: number) => string;
declare type ExpectedConnectionTypesFunction = () => ConnectionPointType[];
export declare class GlConnectionsController {
    private node;
    private _input_name_function;
    private _output_name_function;
    private _expected_input_types_function;
    private _expected_output_types_function;
    constructor(node: BaseGlNodeType);
    set_input_name_function(func: IONameFunction): void;
    set_output_name_function(func: IONameFunction): void;
    set_expected_input_types_function(func: ExpectedConnectionTypesFunction): void;
    set_expected_output_types_function(func: ExpectedConnectionTypesFunction): void;
    output_name(index: number): string;
    private _update_signature_if_required_bound;
    private _initialized;
    initialize_node(): void;
    update_signature_if_required(dirty_trigger?: CoreGraphNode): void;
    private make_successors_update_signatures;
    update_connection_types(): void;
    protected _connections_match_inputs(): boolean;
    first_input_connection_type(): ConnectionPointType | undefined;
    connection_type_from_connection(connection: NodeConnection): ConnectionPointType;
}
export {};
