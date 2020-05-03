import { NodeContext } from '../../../poly/NodeContext';
import { TypedNode } from '../../_Base';
import { NodeTypeMap } from '../../../containers/utils/ContainerMap';
interface DisconnectionOptions {
    set_input?: boolean;
}
export declare class TypedNodeConnection<NC extends NodeContext> {
    private _node_src;
    private _node_dest;
    private _output_index;
    private _input_index;
    private static _next_id;
    private _id;
    constructor(_node_src: TypedNode<NC, any>, _node_dest: TypedNode<NC, any>, _output_index?: number, _input_index?: number);
    get id(): number;
    get node_src(): NodeTypeMap[NC];
    get node_dest(): NodeTypeMap[NC];
    get output_index(): number;
    get input_index(): number;
    disconnect(options?: DisconnectionOptions): void;
}
export {};
