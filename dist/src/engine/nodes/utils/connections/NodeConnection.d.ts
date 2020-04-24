import { BaseNodeType } from '../../_Base';
interface DisconnectionOptions {
    set_input?: boolean;
}
export declare class NodeConnection {
    private _node_src;
    private _node_dest;
    private _output_index;
    private _input_index;
    private static _next_id;
    private _id;
    constructor(_node_src: BaseNodeType, _node_dest: BaseNodeType, _output_index?: number, _input_index?: number);
    get id(): number;
    get node_src(): BaseNodeType;
    get node_dest(): BaseNodeType;
    get output_index(): number;
    get input_index(): number;
    disconnect(options?: DisconnectionOptions): void;
}
export {};
