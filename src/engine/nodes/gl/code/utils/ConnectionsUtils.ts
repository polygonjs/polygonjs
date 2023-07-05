import {NodeContext} from '../../../../poly/NodeContext';
import {TypedNodeConnection} from '../../../utils/io/NodeConnection';

export function glConnectionType(connection: TypedNodeConnection<NodeContext.GL>) {
	const connectionPointForConnection =
		connection.nodeSrc().io.outputs.namedOutputConnectionPoints()[connection.outputIndex()];

	return connectionPointForConnection.type();
}
