import {NodeContext} from '../../../../poly/NodeContext';
import {TypedNodeConnection} from '../../../utils/io/NodeConnection';

export function glConnectionType(connection: TypedNodeConnection<NodeContext.GL>) {
	const connectionPointForConnection =
		connection.node_src.io.outputs.namedOutputConnectionPoints()[connection.output_index];

	return connectionPointForConnection.type();
}
