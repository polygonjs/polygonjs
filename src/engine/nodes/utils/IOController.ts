import {BaseNodeType} from '../_Base';

import {ConnectionsController} from './connections/ConnectionsController';
import {InputsController, InputsControllerOptions} from './connections/InputsController';
import {OutputsController} from './connections/OutputsController';

export class IOController {
	protected _connections = new ConnectionsController(this.node);
	protected _inputs: InputsController;
	protected _outputs: OutputsController;

	constructor(protected node: BaseNodeType) {}

	get connections() {
		return this._connections;
	}

	// inputs
	init_inputs(options: InputsControllerOptions) {
		this.inputs.set_options(options);
	}
	get inputs() {
		return (this._inputs = this._inputs || new InputsController(this.node));
	}
	has_inputs() {
		return this._inputs != null;
	}

	// outputs
	// init_outputs() {
	// 	this._outputs = this._outputs || new OutputsController(this.node);
	// }
	get outputs() {
		return (this._outputs = this._outputs || new OutputsController(this.node));
	}
	has_outputs() {
		return this._outputs != null;
	}
}
