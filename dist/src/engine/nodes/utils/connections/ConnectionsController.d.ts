import { BaseNodeType } from '../../_Base';
import { NodeConnection } from './NodeConnection';
export declare class ConnectionsController {
    protected _node: BaseNodeType;
    private _input_connections;
    private _output_connections;
    constructor(_node: BaseNodeType);
    init_inputs(): void;
    add_input_connection(connection: NodeConnection): void;
    remove_input_connection(connection: NodeConnection): void;
    input_connection(index: number): NodeConnection | undefined;
    first_input_connection(): NodeConnection;
    input_connections(): (NodeConnection | undefined)[] | undefined;
    add_output_connection(connection: NodeConnection): void;
    remove_output_connection(connection: NodeConnection): void;
    output_connections(): NodeConnection[];
}
