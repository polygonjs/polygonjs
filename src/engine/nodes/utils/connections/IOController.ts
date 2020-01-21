import {BaseNodeType} from '../../_Base';

import {ConnectionsController} from './ConnectionsController';
import {InputsController, InputsControllerOptions} from './InputsController';
import {OutputsController} from './OutputsController';

export class IOController<T extends BaseNodeType> {
	protected _connections = new ConnectionsController(this.node);
	protected _inputs: InputsController<T>;
	protected _outputs: OutputsController<T>;

	constructor(protected node: T) {}

	get connections() {
		return this._connections;
	}

	// inputs
	init_inputs(options: InputsControllerOptions) {
		this.inputs.set_options(options);
	}
	get inputs(): InputsController<T> {
		return (this._inputs = this._inputs || new InputsController<T>(this.node));
	}
	has_inputs() {
		return this._inputs != null;
	}

	// outputs
	// init_outputs() {
	// 	this._outputs = this._outputs || new OutputsController(this.node);
	// }
	get outputs(): OutputsController<T> {
		return (this._outputs = this._outputs || new OutputsController<T>(this.node));
	}
	has_outputs() {
		return this._outputs != null;
	}
}
