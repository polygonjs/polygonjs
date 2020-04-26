import {ConnectionsController} from './ConnectionsController';
import {InputsController} from './InputsController';
import {OutputsController} from './OutputsController';
import {NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';

export class IOController<NC extends NodeContext> {
	protected _connections: ConnectionsController<NC> = new ConnectionsController(this.node);
	protected _inputs: InputsController<NC> | undefined;
	protected _outputs: OutputsController<NC> | undefined;

	constructor(protected node: TypedNode<NC, any>) {}

	get connections() {
		return this._connections;
	}

	get inputs(): InputsController<NC> {
		return (this._inputs = this._inputs || new InputsController(this.node));
	}
	has_inputs() {
		return this._inputs != null;
	}

	get outputs(): OutputsController<NC> {
		return (this._outputs = this._outputs || new OutputsController(this.node));
	}
	has_outputs() {
		return this._outputs != null;
	}
}
