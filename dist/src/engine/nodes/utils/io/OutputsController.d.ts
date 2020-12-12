import { NodeContext } from '../../../poly/NodeContext';
import { ConnectionPointTypeMap } from './connections/ConnectionMap';
import { TypedNode } from '../../_Base';
export declare class OutputsController<NC extends NodeContext> {
    private node;
    private _has_outputs;
    private _named_output_connection_points;
    private _has_named_outputs;
    constructor(node: TypedNode<NC, any>);
    set_has_one_output(): void;
    set_has_no_output(): void;
    get has_outputs(): boolean;
    get has_named_outputs(): boolean;
    has_named_output(name: string): boolean;
    get named_output_connection_points(): ConnectionPointTypeMap[NC][];
    named_output_connection(index: number): ConnectionPointTypeMap[NC] | undefined;
    get_named_output_index(name: string): number;
    get_output_index(output_index_or_name: number | string): number;
    named_output_connection_points_by_name(name: string): ConnectionPointTypeMap[NC] | undefined;
    set_named_output_connection_points(connection_points: ConnectionPointTypeMap[NC][], set_dirty?: boolean): void;
    used_output_names(): string[];
}
