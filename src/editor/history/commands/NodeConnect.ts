import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';

export class NodeConnectCommand extends BaseCommand {
	private _old_node_src: BaseNodeType | null;
	private _old_node_output_index: number | undefined;

	constructor(
		private _node_src: BaseNodeType | null,
		private _node_dest: BaseNodeType,
		private _input_index: number,
		private _output_index?: number
	) {
		super();

		this._old_node_src = this._node_dest.io.inputs.input(this._input_index);
		const input_connection = this._node_dest.io.inputs.named_input_connection_points[this._input_index];
		if (input_connection) {
			const input_connections = this._node_dest.io.connections.input_connections();
			if (input_connections) {
				const input_connection = input_connections[this._input_index];
				if (input_connection) {
					this._old_node_output_index = input_connection.output_index;
				}
			}
		}
	}

	do() {
		this._node_dest.set_input(this._input_index, this._node_src, this._output_index);
	}

	undo() {
		this._node_dest.set_input(this._input_index, this._old_node_src, this._old_node_output_index);
	}
}
