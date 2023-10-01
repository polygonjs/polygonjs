import {NodeContext} from '../../../../poly/NodeContext';
import {TypedNodeConnection} from '../../../utils/io/NodeConnection';
import {GlConnectionPointType} from '../../../utils/io/connections/Gl';

export function glConnectionType(connection: TypedNodeConnection<NodeContext.GL>): GlConnectionPointType {
	const connectionPoints = connection.nodeSrc().io.outputs.namedOutputConnectionPoints();
	return connectionPoints ? connectionPoints[connection.outputIndex()].type() : GlConnectionPointType.FLOAT;
}
