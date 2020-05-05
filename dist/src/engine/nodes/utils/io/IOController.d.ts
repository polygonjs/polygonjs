import { ConnectionsController } from './ConnectionsController';
import { InputsController } from './InputsController';
import { OutputsController } from './OutputsController';
import { NodeContext } from '../../../poly/NodeContext';
import { TypedNode } from '../../_Base';
export declare class IOController<NC extends NodeContext> {
    protected node: TypedNode<NC, any>;
    protected _connections: ConnectionsController<NC>;
    protected _inputs: InputsController<NC> | undefined;
    protected _outputs: OutputsController<NC> | undefined;
    constructor(node: TypedNode<NC, any>);
    get connections(): ConnectionsController<NC>;
    get inputs(): InputsController<NC>;
    has_inputs(): boolean;
    get outputs(): OutputsController<NC>;
    has_outputs(): boolean;
}
