import { TypedNodeConnection } from './NodeConnection';
import { NodeContext } from '../../../poly/NodeContext';
import { TypedNode } from '../../_Base';
export declare class ConnectionsController<NC extends NodeContext> {
    protected _node: TypedNode<NC, any>;
    private _input_connections;
    private _output_connections;
    constructor(_node: TypedNode<NC, any>);
    init_inputs(): void;
    add_input_connection(connection: TypedNodeConnection<NC>): void;
    remove_input_connection(connection: TypedNodeConnection<NC>): void;
    input_connection(index: number): TypedNodeConnection<NC> | undefined;
    first_input_connection(): TypedNodeConnection<NC>;
    input_connections(): (TypedNodeConnection<NC> | undefined)[] | undefined;
    add_output_connection(connection: TypedNodeConnection<NC>): void;
    remove_output_connection(connection: TypedNodeConnection<NC>): void;
    output_connections(): TypedNodeConnection<NC>[];
}
