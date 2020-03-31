import { BaseNodeType } from '../../_Base';
import { ConnectionsController } from './ConnectionsController';
import { InputsController } from './InputsController';
import { OutputsController } from './OutputsController';
export declare class IOController<T extends BaseNodeType> {
    protected node: T;
    protected _connections: ConnectionsController;
    protected _inputs: InputsController<T> | undefined;
    protected _outputs: OutputsController<T> | undefined;
    constructor(node: T);
    get connections(): ConnectionsController;
    get inputs(): InputsController<T>;
    has_inputs(): boolean;
    get outputs(): OutputsController<T>;
    has_outputs(): boolean;
}
